import { useState, useEffect } from 'react';
import Topbar from './components/Topbar';
import WatchlistRail from './components/WatchlistRail';
import PriceChart from './components/PriceChart';
import HoldingsTable from './components/HoldingsTable';
import ModelAnalysis from './components/ModelAnalysis';
import NewsAnchorRail from './components/NewsAnchorRail';
import { fetchQuote } from './services/stockApi';

function App() {
  const [activeSymbol, setActiveSymbol] = useState('RELIANCE');
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <Topbar />
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

        {/* Stock header */}
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
      </main>

      <NewsAnchorRail />
    </div>
  );
}

export default App;
