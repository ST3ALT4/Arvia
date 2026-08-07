"""
ARVIA Model Inference Server
=============================
FastAPI backend that loads trained model checkpoints and serves predictions.

Usage:
  cd server/
  pip install -r requirements.txt
  uvicorn main:app --reload --port 8000

Drop model files into server/checkpoints/ — the server hot-reloads them.
See checkpoints/README.md for naming conventions.
"""

import os, glob, logging, pickle
from contextlib import asynccontextmanager
from pathlib import Path

import numpy as np
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from architectures import DL_MODEL_MAP

# ── Config ──
CHECKPOINT_DIR = Path(__file__).parent / "checkpoints"
LOOKBACK = 20                           # Must match training config
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
INPUT_DIM = None                        # Auto-detected from first loaded model

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(message)s")
log = logging.getLogger("arvia")

# ── Model store ──
loaded_models: dict = {}                # key: "{ModelName}_{horizon}d"


def scan_and_load_models():
    """Scan checkpoints/ for .pth and .pkl files and load them."""
    loaded_models.clear()

    # ── DL models (.pth) ──
    for pth_file in sorted(CHECKPOINT_DIR.glob("*.pth")):
        stem = pth_file.stem                    # e.g. "Transformer_TCN_5d"
        parts = stem.rsplit("_", 1)             # ["Transformer_TCN", "5d"]
        if len(parts) != 2 or not parts[1].endswith("d"):
            log.warning(f"Skipping {pth_file.name}: doesn't match {{ModelName}}_{{horizon}}d.pth")
            continue

        model_name = parts[0]
        horizon = parts[1]                      # "5d", "20d", "60d"

        if model_name not in DL_MODEL_MAP:
            log.warning(f"Skipping {pth_file.name}: unknown model '{model_name}'")
            continue

        try:
            checkpoint = torch.load(pth_file, map_location=DEVICE, weights_only=False)

            # Auto-detect input_dim from checkpoint
            state_dict = checkpoint if isinstance(checkpoint, dict) and "model_state_dict" not in checkpoint else checkpoint.get("model_state_dict", checkpoint)

            # Try to infer input_dim from the first weight matrix
            input_dim = _infer_input_dim(state_dict, model_name)
            if input_dim is None:
                log.warning(f"Could not infer input_dim for {pth_file.name}, using default 64")
                input_dim = 64

            model = DL_MODEL_MAP[model_name](input_dim=input_dim)

            if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
                model.load_state_dict(checkpoint["model_state_dict"])
            else:
                model.load_state_dict(state_dict)

            model.to(DEVICE)
            model.eval()
            loaded_models[f"{model_name}_{horizon}"] = ("dl", model)
            log.info(f"✓ Loaded DL model: {model_name} ({horizon}) — input_dim={input_dim}")
        except Exception as e:
            log.error(f"✗ Failed to load {pth_file.name}: {e}")

    # ── Tree models (.pkl) ──
    for pkl_file in sorted(CHECKPOINT_DIR.glob("*.pkl")):
        stem = pkl_file.stem
        parts = stem.rsplit("_", 1)
        if len(parts) != 2 or not parts[1].endswith("d"):
            log.warning(f"Skipping {pkl_file.name}: doesn't match {{ModelName}}_{{horizon}}d.pkl")
            continue

        model_name = parts[0]
        horizon = parts[1]

        try:
            with open(pkl_file, "rb") as f:
                tree_model = pickle.load(f)
            loaded_models[f"{model_name}_{horizon}"] = ("tree", tree_model)
            log.info(f"✓ Loaded tree model: {model_name} ({horizon})")
        except Exception as e:
            log.error(f"✗ Failed to load {pkl_file.name}: {e}")

    if not loaded_models:
        log.info("No model checkpoints found in checkpoints/. Using mock predictions.")
    else:
        log.info(f"Loaded {len(loaded_models)} model(s) total.")


def _infer_input_dim(state_dict, model_name):
    """Try to infer input_dim from the model's first weight tensor."""
    # RNN models: look for lstm.weight_ih_l0 or gru.weight_ih_l0
    for key in ["lstm.weight_ih_l0", "gru.weight_ih_l0"]:
        if key in state_dict:
            # shape: [4*hidden_dim, input_dim] for LSTM, [3*hidden_dim, input_dim] for GRU
            return state_dict[key].shape[1]

    # CNN models: look for cnn.0.weight or conv1.conv.weight
    for key in ["cnn.0.weight", "conv1.conv.weight"]:
        if key in state_dict:
            # shape: [out_channels, in_channels, kernel_size]
            return state_dict[key].shape[1]

    # TFT: input_projection.weight
    if "input_projection.weight" in state_dict:
        return state_dict["input_projection.weight"].shape[1]

    return None


# ── Mock prediction fallback ──

MOCK_PREDICTIONS = {
    "trend": "up", "confidence": 65,
    "priceReturn": 1.2, "volatility": 2.0, "pricePred": 0.0,
}

ALL_MODEL_NAMES = [
    "LSTM", "GRU", "LSTM_GRU", "BiLSTM_Attention",
    "CNN_BiLSTM_Attention", "Transformer_TCN", "TFT",
    "XGBoost", "LightGBM",
]


def mock_single(symbol, model_name, horizon):
    """Generate deterministic mock predictions when no real model is loaded."""
    # Use hash to create reproducible but varied numbers per symbol/model combo
    seed = hash(f"{symbol}_{model_name}_{horizon}") % 10000
    rng = np.random.RandomState(seed)
    trend_up = rng.random() > 0.4
    return {
        "trend": "up" if trend_up else "down",
        "confidence": round(55 + rng.random() * 30, 1),
        "priceReturn": round((rng.random() * 5 - 1.5) if trend_up else (rng.random() * -4 + 0.5), 2),
        "volatility": round(1.0 + rng.random() * 3, 2),
        "pricePred": None,  # Can't predict absolute price without current price
        "source": "mock",
    }


# ── FastAPI App ──

@asynccontextmanager
async def lifespan(app: FastAPI):
    scan_and_load_models()
    yield

app = FastAPI(
    title="ARVIA Model API",
    description="Serves multi-head predictions from trained financial forecasting models.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response schemas ──

class PredictRequest(BaseModel):
    symbol: str
    model: str = "Transformer_TCN"
    horizon: int = 5


class PredictAllRequest(BaseModel):
    symbol: str
    horizon: int = 5


# ── Endpoints ──

@app.get("/api/status")
async def status():
    """Check which models are loaded and available."""
    model_list = []
    for key, (kind, _) in loaded_models.items():
        name, horizon = key.rsplit("_", 1)
        model_list.append({"name": name, "horizon": horizon, "type": kind})

    return {
        "status": "online",
        "modelsLoaded": len(loaded_models),
        "models": model_list,
        "allModelNames": ALL_MODEL_NAMES,
        "device": str(DEVICE),
    }


@app.post("/api/predict")
async def predict(req: PredictRequest):
    """Get prediction from a specific model for a stock."""
    key = f"{req.model}_{req.horizon}d"

    if key not in loaded_models:
        # Return mock data
        return {
            **mock_single(req.symbol, req.model, req.horizon),
            "model": req.model,
            "horizon": req.horizon,
            "symbol": req.symbol,
        }

    kind, model = loaded_models[key]

    # TODO: implement real inference with feature engineering pipeline
    # For now, this placeholder shows the structure:
    # 1. Fetch recent OHLCV data for symbol (LOOKBACK days)
    # 2. Run feature engineering (same as training pipeline)
    # 3. Create input tensor [1, LOOKBACK, num_features]
    # 4. Run model.forward(input_tensor) → 4-head output
    # 5. Format and return

    return {
        **mock_single(req.symbol, req.model, req.horizon),
        "model": req.model,
        "horizon": req.horizon,
        "symbol": req.symbol,
        "source": "model_loaded_but_inference_pipeline_pending",
    }


@app.post("/api/predict/all")
async def predict_all(req: PredictAllRequest):
    """Get predictions from all models for a stock."""
    results = {}
    for model_name in ALL_MODEL_NAMES:
        key = f"{model_name}_{req.horizon}d"
        if key in loaded_models:
            results[model_name] = {
                **mock_single(req.symbol, model_name, req.horizon),
                "source": "model_loaded_but_inference_pipeline_pending",
            }
        else:
            results[model_name] = mock_single(req.symbol, model_name, req.horizon)
    return results


@app.post("/api/reload")
async def reload_models():
    """Hot-reload model checkpoints from disk."""
    scan_and_load_models()
    return {"status": "reloaded", "modelsLoaded": len(loaded_models)}
