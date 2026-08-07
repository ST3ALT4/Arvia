import { useState, useEffect } from 'react';
import { fetchAllPredictions, fetchModelStatus } from '../services/modelApi';
import { MODEL_NAMES, modelPredictions } from '../data/mockData';

export default function ModelAnalysis({ symbol, currentPrice }) {
  const [selectedModel, setSelectedModel] = useState('Transformer_TCN');
  const [predictions, setPredictions] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');
  const [horizon, setHorizon] = useState(5);

  // Check model server status on mount
  useEffect(() => {
    fetchModelStatus().then((s) => setServerStatus(s.status));
  }, []);

  // Fetch predictions from backend, fall back to mock data
  useEffect(() => {
    let cancelled = false;

    fetchAllPredictions(symbol, horizon).then((data) => {
      if (!cancelled) {
        if (data) {
          setPredictions(data);
          setServerStatus('online');
        } else {
          // Backend offline — use mock data
          setPredictions(modelPredictions[symbol] || null);
          setServerStatus('offline');
        }
      }
    });

    return () => { cancelled = true; };
  }, [symbol, horizon]);

  if (!predictions) {
    return (
      <div className="model-section">
        <div className="section-header">
          <div className="section-title">
            <span className="display">Model Analysis</span>
            <span className="section-badge">4-HEAD</span>
          </div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center', padding: '32px' }}>
          <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>
            No model predictions available for {symbol}
          </span>
        </div>
      </div>
    );
  }

  const pred = predictions[selectedModel];
  const refPrice = currentPrice || 0;

  return (
    <div className="model-section" id="model-analysis">
      <div className="section-header">
        <div className="section-title">
          <span className="display">Model Analysis</span>
          <span className="section-badge">4-HEAD</span>
          {serverStatus === 'offline' && (
            <span style={{
              fontSize: 10, color: 'var(--text-dim)',
              background: 'var(--surface-2)', padding: '2px 8px',
              borderRadius: 12, border: '1px solid var(--border)',
            }}>
              MOCK DATA
            </span>
          )}
        </div>
        {/* Horizon selector */}
        <div className="range-tabs" style={{ margin: 0 }}>
          {[5, 20, 60].map((h) => (
            <button
              key={h}
              className={`range-tab${horizon === h ? ' active' : ''}`}
              onClick={() => setHorizon(h)}
            >
              {h}D
            </button>
          ))}
        </div>
      </div>

      {/* Model selector pills */}
      <div className="model-pills" style={{ marginBottom: 16 }}>
        {MODEL_NAMES.map((name) => (
          <button
            key={name}
            className={`model-pill${selectedModel === name ? ' active' : ''}`}
            onClick={() => setSelectedModel(name)}
            id={`model-${name}`}
          >
            {name.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* 4-head prediction cards */}
      {pred && (
        <div className="prediction-grid">
          <div className="prediction-card">
            <div className="prediction-head-label">Trend Direction</div>
            <div className={`trend-badge ${pred.trend}`}>
              {pred.trend === 'up' ? '▲' : '▼'} {pred.trend === 'up' ? 'Bullish' : 'Bearish'}
            </div>
            <div className="prediction-detail" style={{ marginTop: 8 }}>
              Confidence: <span className="mono">{pred.confidence}%</span>
            </div>
          </div>
          <div className="prediction-card">
            <div className="prediction-head-label">Price Return</div>
            <div className={`prediction-value mono ${pred.priceReturn >= 0 ? 'up' : 'down'}`}>
              {pred.priceReturn >= 0 ? '+' : ''}{Number(pred.priceReturn).toFixed(1)}%
            </div>
            <div className="prediction-detail">Expected {horizon}-day return</div>
          </div>
          <div className="prediction-card">
            <div className="prediction-head-label">Volatility</div>
            <div className="prediction-value mono">{Number(pred.volatility).toFixed(1)}%</div>
            <div className="prediction-detail">Expected {horizon}-day volatility</div>
          </div>
          <div className="prediction-card">
            <div className="prediction-head-label">Price Prediction</div>
            <div className={`prediction-value mono ${
              pred.pricePred && pred.pricePred >= refPrice ? 'up' : 'down'
            }`}>
              {pred.pricePred ? `₹${Number(pred.pricePred).toFixed(2)}` : '—'}
            </div>
            <div className="prediction-detail">Predicted price ({horizon}D)</div>
          </div>
        </div>
      )}

      {/* Model comparison table */}
      <div className="comparison-card">
        <table>
          <thead>
            <tr>
              <th>Model</th>
              <th className="th-right">Trend</th>
              <th className="th-right">Confidence</th>
              <th className="th-right">Return</th>
              <th className="th-right">Volatility</th>
              <th className="th-right">Price Pred.</th>
            </tr>
          </thead>
          <tbody>
            {MODEL_NAMES.map((name) => {
              const p = predictions[name];
              if (!p) return null;
              const isSelected = selectedModel === name;
              return (
                <tr
                  key={name}
                  style={isSelected ? { background: 'var(--accent-soft)' } : { cursor: 'pointer' }}
                  onClick={() => setSelectedModel(name)}
                >
                  <td className="model-name-cell">{name.replace(/_/g, ' ')}</td>
                  <td className={`td-right mono ${p.trend}`}>
                    {p.trend === 'up' ? '▲' : '▼'}
                  </td>
                  <td className="td-right mono">{p.confidence}%</td>
                  <td className={`td-right mono ${p.priceReturn >= 0 ? 'up' : 'down'}`}>
                    {p.priceReturn >= 0 ? '+' : ''}{Number(p.priceReturn).toFixed(1)}%
                  </td>
                  <td className="td-right mono">{Number(p.volatility).toFixed(1)}%</td>
                  <td className={`td-right mono ${
                    p.pricePred && p.pricePred >= refPrice ? 'up' : 'down'
                  }`}>
                    {p.pricePred ? `₹${Number(p.pricePred).toFixed(2)}` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="model-disclaimer">
          These are computational model outputs, not investment advice. Models are trained on historical data and predictions may not reflect future performance.
        </div>
      </div>
    </div>
  );
}
