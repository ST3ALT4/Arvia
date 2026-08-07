import { useState, useEffect } from 'react';
import Topbar from './components/Topbar';
import WatchlistRail from './components/WatchlistRail';
import PriceChart from './components/PriceChart';
import HoldingsTable from './components/HoldingsTable';
import ModelAnalysis from './components/ModelAnalysis';
import NewsAnchorRail from './components/NewsAnchorRail';
import PlainEnglishDecoder from './components/PlainEnglishDecoder';
import TruthDetector from './components/TruthDetector';
import PocketLeakHunter from './components/PocketLeakHunter';
import GoalSimulator from './components/GoalSimulator';
import PanicCircuitBreaker from './components/PanicCircuitBreaker';
import { fetchQuote } from './services/stockApi';

function App() {
  const [activeSymbol, setActiveSymbol] = useState('RELIANCE');
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'tools'

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchQuote(activeSymbol)
      .then((data) => {
        if (!cancelled) {
          setQuote(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Quote fetch failed:', err);
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [activeSymbol]);

  const formatPrice = (price) => {
    if (price == null) return '—';
    return '₹' + price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="app">
      <Topbar activeView={activeView} onViewChange={setActiveView} />
      <WatchlistRail activeSymbol={activeSymbol} onSelect={setActiveSymbol} />

      <main className="main">
        {/* Compliance disclaimer strip — required on every page per main.md §5 */}
        <div className="disclaimer-strip" id="disclaimer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7A8699" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v5" />
            <path d="M12 16h.01" />
          </svg>
          ARVIA displays historical and live performance data only. It does not rate, recommend, or advise on any security.
        </div>

        {/* Stock header — always visible */}
        <div className="main-header">
          <div>
            <div className="stock-title display">
              {activeSymbol}{' '}
              {quote && (
                <span style={{ color: 'var(--text-dim)', fontSize: 14, fontWeight: 400 }}>
                  · {quote.fullName}
                </span>
              )}
            </div>
            <div className="stock-sub">
              {quote ? `${quote.exchange} · ${quote.currency}` : 'Loading…'}
            </div>
          </div>
          <div className="stock-price-block">
            {loading ? (
              <div className="stock-price mono" style={{ color: 'var(--text-dim)' }}>Loading…</div>
            ) : quote ? (
              <>
                <div className="stock-price mono">{formatPrice(quote.price)}</div>
                <div className={`stock-delta ${quote.direction} mono`}>
                  {quote.direction === 'up' ? '▲' : '▼'}{' '}
                  {Math.abs(quote.change).toFixed(2)} ({Math.abs(quote.changePct)}%) today
                </div>
              </>
            ) : (
              <div className="stock-price mono" style={{ color: 'var(--loss)' }}>Data unavailable</div>
            )}
          </div>
        </div>

        {/* View Switch Tabs */}
        <div className="view-tabs" id="view-tabs">
          <button
            className={`view-tab${activeView === 'dashboard' ? ' active' : ''}`}
            onClick={() => setActiveView('dashboard')}
            id="view-dashboard"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            Dashboard
          </button>
          <button
            className={`view-tab${activeView === 'tools' ? ' active' : ''}`}
            onClick={() => setActiveView('tools')}
            id="view-tools"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 0 0-7.07 17.07l1.41-1.41A8 8 0 1 1 20 12" />
              <path d="M12 6v6l4 2" />
            </svg>
            Smart Tools
            <span className="view-tab-new">NEW</span>
          </button>
        </div>

        {/* ═══ DASHBOARD VIEW ═══ */}
        {activeView === 'dashboard' && (
          <>
            {/* Chart — real Yahoo Finance data */}
            <PriceChart symbol={activeSymbol} />

            {/* Stat cards */}
            <div className="grid-2">
              <div className="stat-card">
                <div className="stat-label">52W Range</div>
                <div className="stat-value mono">{quote?.stats?.range52w || '—'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Volume (today)</div>
                <div className="stat-value mono">{quote?.stats?.volume || '—'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Market Cap</div>
                <div className="stat-value mono">{quote?.stats?.marketCap || '—'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">P/E (TTM)</div>
                <div className="stat-value mono">{quote?.stats?.pe || '—'}</div>
              </div>
            </div>

            {/* Model Analysis — 9 models × 4 heads */}
            <ModelAnalysis symbol={activeSymbol} currentPrice={quote?.price} />

            {/* Holdings */}
            <HoldingsTable />
          </>
        )}

        {/* ═══ SMART TOOLS VIEW ═══ */}
        {activeView === 'tools' && (
          <div className="tools-view">
            {/* Plain English Decoder — contextual to active stock */}
            <PlainEnglishDecoder quote={quote} />

            {/* Divider */}
            <div className="tools-divider">
              <div className="tools-divider-line" />
              <span className="tools-divider-label">INDEPENDENT TOOLS</span>
              <div className="tools-divider-line" />
            </div>

            {/* Truth Detector — standalone text analyzer */}
            <TruthDetector />

            {/* Divider */}
            <div className="tools-divider">
              <div className="tools-divider-line" />
              <span className="tools-divider-label">WEALTH PROTECTION</span>
              <div className="tools-divider-line" />
            </div>

            {/* Pocket-Leak Hunter */}
            <PocketLeakHunter />

            {/* Divider */}
            <div className="tools-divider">
              <div className="tools-divider-line" />
              <span className="tools-divider-label">GOAL PLANNING</span>
              <div className="tools-divider-line" />
            </div>

            {/* Goal Simulator */}
            <GoalSimulator />

            {/* Divider */}
            <div className="tools-divider">
              <div className="tools-divider-line" />
              <span className="tools-divider-label">EMOTIONAL GUARDRAILS</span>
              <div className="tools-divider-line" />
            </div>

            {/* Panic-Trade Circuit Breaker */}
            <PanicCircuitBreaker />
          </div>
        )}
      </main>

      <NewsAnchorRail />
    </div>
  );
}

export default App;
