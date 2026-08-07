import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchQuote, searchStocks } from '../services/stockApi';

const DEFAULT_WATCHLIST = [
  { symbol: 'RELIANCE', name: 'Reliance Industries' },
  { symbol: 'TCS', name: 'Tata Consultancy Svcs' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank' },
  { symbol: 'INFY', name: 'Infosys' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors' },
  { symbol: 'ITC', name: 'ITC Ltd' },
];

/** Load watchlist from localStorage or use defaults */
function loadWatchlist() {
  try {
    const saved = localStorage.getItem('arvia_watchlist');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return DEFAULT_WATCHLIST;
}

/** Save watchlist to localStorage */
function saveWatchlist(list) {
  localStorage.setItem('arvia_watchlist', JSON.stringify(list));
}

export default function WatchlistRail({ activeSymbol, onSelect }) {
  const [watchlist, setWatchlist] = useState(loadWatchlist);
  const [liveData, setLiveData] = useState({});
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Persist watchlist changes
  useEffect(() => {
    saveWatchlist(watchlist);
  }, [watchlist]);

  // Fetch live prices for all watchlist symbols
  useEffect(() => {
    watchlist.forEach(({ symbol }) => {
      if (!liveData[symbol]) {
        fetchQuote(symbol)
          .then((data) => {
            setLiveData((prev) => ({ ...prev, [symbol]: data }));
          })
          .catch(() => { /* silent */ });
      }
    });
  }, [watchlist]);

  // Debounced search
  const handleSearch = useCallback((value) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setSearching(true);
    setShowDropdown(true);

    debounceRef.current = setTimeout(() => {
      searchStocks(value)
        .then((results) => {
          setSearchResults(results);
          setSearching(false);
        })
        .catch(() => {
          setSearching(false);
        });
    }, 300);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        searchRef.current && !searchRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add stock to watchlist
  const addToWatchlist = (result) => {
    const baseSymbol = result.baseSymbol || result.symbol.replace(/\.(NS|BO)$/, '');
    const already = watchlist.some((w) => w.symbol === baseSymbol);
    if (already) {
      // Just select it
      onSelect(baseSymbol);
    } else {
      setWatchlist((prev) => [
        ...prev,
        { symbol: baseSymbol, name: result.longName || result.shortName },
      ]);
      onSelect(baseSymbol);
    }
    setQuery('');
    setShowDropdown(false);
    setSearchResults([]);
  };

  // Remove stock from watchlist
  const removeFromWatchlist = (symbol, e) => {
    e.stopPropagation();
    setWatchlist((prev) => prev.filter((w) => w.symbol !== symbol));
    // If removing the active stock, select the first remaining
    if (activeSymbol === symbol) {
      const remaining = watchlist.filter((w) => w.symbol !== symbol);
      if (remaining.length > 0) onSelect(remaining[0].symbol);
    }
  };

  const formatPrice = (price) => {
    if (price == null) return '—';
    return price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Calculate total portfolio value from live data
  const totalInvested = watchlist.reduce((sum, w) => {
    const data = liveData[w.symbol];
    return sum + (data?.price || 0);
  }, 0);

  return (
    <aside className="rail">
      {/* Search input */}
      <div className="search-container">
        <input
          ref={searchRef}
          className="search"
          placeholder="Search stocks…"
          id="search-input"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => { if (query.trim()) setShowDropdown(true); }}
          autoComplete="off"
        />
        {query && (
          <button
            className="search-clear"
            onClick={() => { setQuery(''); setShowDropdown(false); setSearchResults([]); }}
            aria-label="Clear search"
          >
            ×
          </button>
        )}

        {/* Search dropdown */}
        {showDropdown && (
          <div className="search-dropdown" ref={dropdownRef}>
            {searching ? (
              <div className="search-status">Searching…</div>
            ) : searchResults.length === 0 ? (
              <div className="search-status">
                {query.trim() ? 'No stocks found' : 'Type to search'}
              </div>
            ) : (
              searchResults.map((result) => {
                const isInWatchlist = watchlist.some(
                  (w) => w.symbol === result.baseSymbol
                );
                return (
                  <div
                    key={result.symbol}
                    className="search-result"
                    onClick={() => addToWatchlist(result)}
                  >
                    <div className="search-result-left">
                      <div className="search-result-symbol">
                        <span className="mono">{result.baseSymbol || result.symbol}</span>
                        <span className="search-result-exchange">{result.exchDisp}</span>
                      </div>
                      <div className="search-result-name">{result.longName}</div>
                    </div>
                    <div className="search-result-right">
                      {isInWatchlist ? (
                        <span className="search-result-badge in-list">✓ Listed</span>
                      ) : (
                        <span className="search-result-badge add">+ Add</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <div className="rail-label">
        Watchlist
        <span className="watchlist-count">{watchlist.length}</span>
      </div>

      {watchlist.map(({ symbol, name }) => {
        const data = liveData[symbol];
        return (
          <div
            key={symbol}
            className={`watch-item${activeSymbol === symbol ? ' active' : ''}`}
            onClick={() => onSelect(symbol)}
            onMouseEnter={() => setHoveredItem(symbol)}
            onMouseLeave={() => setHoveredItem(null)}
            id={`watchlist-${symbol}`}
          >
            <div className="watch-left">
              <span className="watch-symbol mono">{symbol}</span>
              <span className="watch-name">{data?.fullName || name}</span>
            </div>
            <div className="watch-right">
              {hoveredItem === symbol ? (
                <button
                  className="watch-remove"
                  onClick={(e) => removeFromWatchlist(symbol, e)}
                  title="Remove from watchlist"
                  aria-label={`Remove ${symbol}`}
                >
                  ×
                </button>
              ) : (
                <>
                  <span className="watch-price mono">
                    {data ? formatPrice(data.price) : '…'}
                  </span>
                  <span className={`watch-change ${data?.direction || ''} mono`}>
                    {data ? `${data.changePct >= 0 ? '+' : ''}${data.changePct}%` : ''}
                  </span>
                </>
              )}
            </div>
          </div>
        );
      })}

      <div className="rail-label">Portfolio</div>
      <div className="watch-item">
        <div className="watch-left"><span className="watch-symbol">Stocks tracked</span></div>
        <div className="watch-right"><span className="watch-price mono">{watchlist.length}</span></div>
      </div>
    </aside>
  );
}
