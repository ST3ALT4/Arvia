"""
Unified Models — Multi-Head Architectures (copied from capstone)
================================================================
All DL models follow the shared-encoder + multi-head-decoder pattern:

    Input [B, T, F] → Encoder backbone → encoded repr
                       ├→ Trend Head      (logits → BCE)
                       ├→ Price Ret Head   (linear → GMADL/MSE)
                       ├→ Vol Head         (softplus → MSE)
                       └→ Price Pred Head  (linear → MSE)

Also includes TreeMultiOutput wrapper for XGBoost/LightGBM.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F


# ════════════════════════════════════════════════════════════════
# SHARED BUILDING BLOCKS
# ════════════════════════════════════════════════════════════════


class MultiOutputHead(nn.Module):
    """Standard 4-head decoder attached to any encoder backbone."""

    def __init__(self, enc_dim, hidden_dim=64, dropout=0.3):
        super().__init__()
        self.norm = nn.LayerNorm(enc_dim)

        def _make_head(out_features=1):
            return nn.Sequential(
                nn.Linear(enc_dim, hidden_dim),
                nn.GELU(),
                nn.Dropout(dropout),
                nn.Linear(hidden_dim, hidden_dim // 2),
                nn.GELU(),
                nn.Dropout(dropout * 0.5),
                nn.Linear(hidden_dim // 2, out_features),
            )

        self.trend_head      = _make_head()
        self.price_head      = _make_head()
        self.vol_head        = _make_head()
        self.price_pred_head = _make_head()

    def forward(self, enc):
        enc = self.norm(enc)
        return {
            "trend":      self.trend_head(enc),
            "price":      self.price_head(enc),
            "vol":        torch.clamp(F.softplus(self.vol_head(enc)), max=10.0),
            "price_pred": self.price_pred_head(enc),
        }


class CausalConv1d(nn.Module):
    """Causal 1D convolution (no future leakage)."""

    def __init__(self, in_ch, out_ch, kernel_size, dilation=1):
        super().__init__()
        self.pad = (kernel_size - 1) * dilation
        self.conv = nn.Conv1d(in_ch, out_ch, kernel_size, dilation=dilation)
        self.norm = nn.BatchNorm1d(out_ch)

    def forward(self, x):
        return torch.relu(self.norm(self.conv(F.pad(x, (self.pad, 0)))))


# ════════════════════════════════════════════════════════════════
# 1. MULTI-OUTPUT LSTM
# ════════════════════════════════════════════════════════════════

class MultiOutputLSTM(nn.Module):
    def __init__(self, input_dim, hidden_dim=64, num_layers=2, dropout=0.3):
        super().__init__()
        self.lstm = nn.LSTM(
            input_dim, hidden_dim, num_layers=num_layers,
            batch_first=True, dropout=dropout if num_layers > 1 else 0.0,
        )
        self.dropout = nn.Dropout(dropout)
        self.heads = MultiOutputHead(hidden_dim)

    def forward(self, x):
        _, (h_n, _) = self.lstm(x)
        enc = self.dropout(h_n[-1])
        return self.heads(enc)


# ════════════════════════════════════════════════════════════════
# 2. MULTI-OUTPUT GRU
# ════════════════════════════════════════════════════════════════

class MultiOutputGRU(nn.Module):
    def __init__(self, input_dim, hidden_dim=64, num_layers=2, dropout=0.3):
        super().__init__()
        self.gru = nn.GRU(
            input_dim, hidden_dim, num_layers=num_layers,
            batch_first=True, dropout=dropout if num_layers > 1 else 0.0,
        )
        self.dropout = nn.Dropout(dropout)
        self.heads = MultiOutputHead(hidden_dim)

    def forward(self, x):
        _, h_n = self.gru(x)
        enc = self.dropout(h_n[-1])
        return self.heads(enc)


# ════════════════════════════════════════════════════════════════
# 3. MULTI-OUTPUT LSTM-GRU HYBRID
# ════════════════════════════════════════════════════════════════

class MultiOutputLSTM_GRU(nn.Module):
    def __init__(self, input_dim, hidden_dim=64, dropout=0.3):
        super().__init__()
        self.lstm = nn.LSTM(
            input_dim, hidden_dim, num_layers=2,
            batch_first=True, dropout=dropout,
        )
        self.gru = nn.GRU(hidden_dim, hidden_dim, batch_first=True)
        self.dropout = nn.Dropout(dropout)
        self.heads = MultiOutputHead(hidden_dim)

    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        gru_out, _ = self.gru(lstm_out)
        enc = self.dropout(gru_out[:, -1, :])
        return self.heads(enc)


# ════════════════════════════════════════════════════════════════
# 4. MULTI-OUTPUT BiLSTM + ATTENTION
# ════════════════════════════════════════════════════════════════

class MultiOutputBiLSTMAttention(nn.Module):
    def __init__(self, input_dim, hidden_dim=64, dropout=0.3):
        super().__init__()
        self.lstm = nn.LSTM(
            input_dim, hidden_dim, num_layers=2,
            batch_first=True, bidirectional=True, dropout=dropout,
        )
        self.attention = nn.Sequential(
            nn.Linear(hidden_dim * 2, hidden_dim), nn.Tanh(),
            nn.Linear(hidden_dim, 1),
        )
        self.dropout = nn.Dropout(dropout)
        self.heads = MultiOutputHead(hidden_dim * 2)

    def forward(self, x):
        out, _ = self.lstm(x)
        w = torch.softmax(self.attention(out), dim=1)
        ctx = torch.sum(w * out, dim=1)
        enc = self.dropout(ctx)
        return self.heads(enc)


# ════════════════════════════════════════════════════════════════
# 5. MULTI-OUTPUT CNN-BiLSTM-ATTENTION (Triple Hybrid)
# ════════════════════════════════════════════════════════════════

class MultiOutputCNNBiLSTMAttention(nn.Module):
    def __init__(self, input_dim, hidden_dim=64, cnn_filters=64,
                 kernel_size=3, dropout=0.3):
        super().__init__()
        self.cnn = nn.Sequential(
            nn.Conv1d(input_dim, cnn_filters, kernel_size, padding=kernel_size // 2),
            nn.BatchNorm1d(cnn_filters), nn.GELU(),
            nn.Conv1d(cnn_filters, cnn_filters, kernel_size, padding=kernel_size // 2),
            nn.BatchNorm1d(cnn_filters), nn.GELU(),
        )
        self.lstm = nn.LSTM(
            cnn_filters, hidden_dim, num_layers=2,
            batch_first=True, bidirectional=True, dropout=dropout,
        )
        self.attention = nn.Sequential(
            nn.Linear(hidden_dim * 2, hidden_dim), nn.Tanh(),
            nn.Linear(hidden_dim, 1),
        )
        self.dropout = nn.Dropout(dropout)
        self.heads = MultiOutputHead(hidden_dim * 2)

    def forward(self, x):
        x = x.permute(0, 2, 1)
        x = self.cnn(x)
        x = x.permute(0, 2, 1)
        out, _ = self.lstm(x)
        w = torch.softmax(self.attention(out), dim=1)
        ctx = torch.sum(w * out, dim=1)
        enc = self.dropout(ctx)
        return self.heads(enc)


# ════════════════════════════════════════════════════════════════
# 6. MULTI-OUTPUT TRANSFORMER-TCN
# ════════════════════════════════════════════════════════════════

class MultiOutputTransformerTCN(nn.Module):
    def __init__(self, input_dim, hidden_dim=64, num_heads=4,
                 num_layers=2, dropout=0.3):
        super().__init__()
        self.conv1 = CausalConv1d(input_dim, hidden_dim, 3, dilation=1)
        self.conv2 = CausalConv1d(hidden_dim, hidden_dim, 3, dilation=2)
        self.conv3 = CausalConv1d(hidden_dim, hidden_dim, 3, dilation=4)
        self.norm = nn.LayerNorm(hidden_dim)
        enc_layer = nn.TransformerEncoderLayer(
            d_model=hidden_dim, nhead=num_heads,
            dim_feedforward=hidden_dim * 4, dropout=dropout,
            batch_first=True, activation="gelu",
        )
        self.transformer = nn.TransformerEncoder(enc_layer, num_layers=num_layers)
        self.dropout = nn.Dropout(dropout)
        self.heads = MultiOutputHead(hidden_dim)

    def forward(self, x):
        x = x.permute(0, 2, 1)
        x = self.conv3(self.conv2(self.conv1(x)))
        x = x.permute(0, 2, 1)
        x = self.transformer(self.norm(x))
        enc = self.dropout(x.mean(dim=1))
        return self.heads(enc)


# ════════════════════════════════════════════════════════════════
# 7. MULTI-OUTPUT TEMPORAL FUSION TRANSFORMER (TFT)
# ════════════════════════════════════════════════════════════════

class GLU(nn.Module):
    def __init__(self, d_model):
        super().__init__()
        self.fc = nn.Linear(d_model, d_model * 2)

    def forward(self, x):
        x = self.fc(x)
        out, gate = x.chunk(2, dim=-1)
        return out * torch.sigmoid(gate)


class GRN(nn.Module):
    def __init__(self, d_model, hidden_dim, dropout=0.3):
        super().__init__()
        self.fc1 = nn.Linear(d_model, hidden_dim)
        self.elu = nn.ELU()
        self.fc2 = nn.Linear(hidden_dim, d_model)
        self.dropout = nn.Dropout(dropout)
        self.gate = GLU(d_model)
        self.norm = nn.LayerNorm(d_model)

    def forward(self, x):
        residual = x
        x = self.fc1(x)
        x = self.elu(x)
        x = self.fc2(x)
        x = self.dropout(x)
        x = self.gate(x)
        return self.norm(residual + x)


class MultiOutputTFT(nn.Module):
    def __init__(self, input_dim, hidden_dim=64, num_heads=4, num_layers=2, dropout=0.3):
        super().__init__()
        self.input_projection = nn.Linear(input_dim, hidden_dim)
        self.local_grns = nn.ModuleList([
            GRN(hidden_dim, hidden_dim, dropout) for _ in range(num_layers)
        ])
        self.attention = nn.MultiheadAttention(
            embed_dim=hidden_dim, num_heads=num_heads, dropout=dropout, batch_first=True
        )
        self.attn_norm = nn.LayerNorm(hidden_dim)
        self.attn_gate = GLU(hidden_dim)
        self.ffn_grn = GRN(hidden_dim, hidden_dim, dropout)
        self.dropout = nn.Dropout(dropout)
        self.heads = MultiOutputHead(hidden_dim)

    def forward(self, x):
        x = self.input_projection(x)
        for grn in self.local_grns:
            x = grn(x)
        attn_out, _ = self.attention(x, x, x)
        x = self.attn_norm(x + self.attn_gate(attn_out))
        x = self.ffn_grn(x)
        enc = self.dropout(x.mean(dim=1))
        return self.heads(enc)


# ════════════════════════════════════════════════════════════════
# 8. TREE MULTI-OUTPUT WRAPPER
# ════════════════════════════════════════════════════════════════

class TreeMultiOutput:
    def __init__(self, models=None):
        self.models = models or {}

    def predict(self, X):
        results = {}
        for key, model in self.models.items():
            if key == "trend":
                if hasattr(model, "predict_proba"):
                    results[key] = model.predict_proba(X)[:, 1]
                else:
                    results[key] = model.predict(X)
            else:
                results[key] = model.predict(X)
        return results


# ════════════════════════════════════════════════════════════════
# MODEL REGISTRY
# ════════════════════════════════════════════════════════════════

DL_MODEL_MAP = {
    "LSTM": MultiOutputLSTM,
    "GRU": MultiOutputGRU,
    "LSTM_GRU": MultiOutputLSTM_GRU,
    "BiLSTM_Attention": MultiOutputBiLSTMAttention,
    "CNN_BiLSTM_Attention": MultiOutputCNNBiLSTMAttention,
    "Transformer_TCN": MultiOutputTransformerTCN,
    "TFT": MultiOutputTFT,
}
