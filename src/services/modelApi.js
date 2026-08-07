/**
 * Model prediction API service.
 *
 * Connects to the local Python backend (FastAPI) that loads your
 * trained model checkpoints and runs inference.
 *
 * The backend expects model files in:  server/checkpoints/
 *   - DL models:  {model_name}_{horizon}d.pth   (e.g. Transformer_TCN_5d.pth)
 *   - Tree models: {model_name}_{horizon}d.pkl   (e.g. XGBoost_5d.pkl)
 *
 * Until models are dropped in, the backend returns mock predictions.
 */

const MODEL_API = import.meta.env.VITE_MODEL_API_URL || 'http://localhost:8000/api';

/**
 * Fetch predictions from a specific model for a stock.
 * @param {string} symbol   — NSE symbol (e.g. "RELIANCE")
 * @param {string} model    — model name (e.g. "Transformer_TCN")
 * @param {number} horizon  — forecast horizon in days (5, 20, 60)
 * @returns {Promise<{trend, confidence, priceReturn, volatility, pricePred}>}
 */
export async function fetchPrediction(symbol, model, horizon = 5) {
  try {
    const res = await fetch(`${MODEL_API}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, model, horizon }),
    });
    if (!res.ok) throw new Error(`Model API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`Model API unavailable (${err.message}), using fallback data`);
    return null;
  }
}

/**
 * Fetch predictions from ALL models for a stock.
 * @param {string} symbol
 * @param {number} horizon
 * @returns {Promise<object>} — keyed by model name
 */
export async function fetchAllPredictions(symbol, horizon = 5) {
  try {
    const res = await fetch(`${MODEL_API}/predict/all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, horizon }),
    });
    if (!res.ok) throw new Error(`Model API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`Model API unavailable (${err.message}), using fallback data`);
    return null;
  }
}

/**
 * Check which models are loaded and available.
 * @returns {Promise<{models: string[], status: string}>}
 */
export async function fetchModelStatus() {
  try {
    const res = await fetch(`${MODEL_API}/status`);
    if (!res.ok) throw new Error(`Model API error: ${res.status}`);
    return await res.json();
  } catch {
    return { models: [], status: 'offline' };
  }
}
