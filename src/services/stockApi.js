/**
 * Yahoo Finance stock data service.
 * Uses Vite proxy (/yf, /yf2) to bypass CORS in dev.
 *
 * Ticker format for NSE: SYMBOL.NS  (e.g. RELIANCE.NS)
 * Ticker format for BSE: SYMBOL.BO
 */

const ENDPOINTS = ['/yf', '/yf2'];

/** Fetch with automatic fallback between query1 and query2 endpoints */
async function yfFetch(path) {
  let lastErr;
  for (const base of ENDPOINTS) {
    try {
      const res = await fetch(`${base}${path}`);
      if (res.ok) return await res.json();
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

// ════════════════════════════════════════════
// SEARCH
// ════════════════════════════════════════════

/**
 * Search for stocks by name or symbol.
 * @param {string} query — search term (e.g. "reliance", "TCS", "HDFC")
 * @returns {Promise<Array<{symbol, shortName, longName, exchange, exchDisp, sector, type}>>}
 */
export async function searchStocks(query) {
  if (!query || query.trim().length < 1) return [];

  const json = await yfFetch(
    `/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0&listsCount=0`
  );

  return (json.quotes || [])
    .filter((q) => q.isYahooFinance && q.quoteType === 'EQUITY')
    .map((q) => ({
      symbol: q.symbol,
      shortName: q.shortname || q.symbol,
      longName: q.longname || q.shortname || q.symbol,
      exchange: q.exchange,
      exchDisp: q.exchDisp || q.exchange,
      sector: q.sector || '',
      type: q.typeDisp || 'Equity',
      // Extract the base symbol (before .NS / .BO suffix)
      baseSymbol: q.symbol.replace(/\.(NS|BO)$/, ''),
      isIndian: q.exchange === 'NSI' || q.exchange === 'BSE',
    }));
}

// ════════════════════════════════════════════
// CHART DATA
// ════════════════════════════════════════════

/**
 * Fetch historical chart data for a given symbol.
 * @param {string} symbol — NSE symbol without suffix (e.g. "RELIANCE")
 * @param {string} range  — 1d, 5d, 1mo, 6mo, 1y, 5y, max
 * @param {string} interval — 1m, 5m, 15m, 1d, 1wk, 1mo
 * @returns {Promise<{labels: string[], prices: number[], meta: object}>}
 */
export async function fetchChart(symbol, range = '1mo', interval = '1d') {
  const ticker = symbol.includes('.') ? symbol : `${symbol}.NS`;

  const json = await yfFetch(
    `/v8/finance/chart/${ticker}?range=${range}&interval=${interval}&includePrePost=false`
  );

  const result = json.chart?.result?.[0];
  if (!result) throw new Error('No chart data returned');

  const timestamps = result.timestamp || [];
  const closes = result.indicators?.quote?.[0]?.close || [];
  const meta = result.meta || {};

  const labels = timestamps.map((ts) => {
    const d = new Date(ts * 1000);
    if (range === '1d' || range === '5d') {
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  });

  const prices = closes.map((c) => (c != null ? parseFloat(c.toFixed(2)) : null));

  return { labels, prices, meta };
}

// ════════════════════════════════════════════
// QUOTE DATA
// ════════════════════════════════════════════

/**
 * Fetch current quote/stats for a symbol.
 * @param {string} symbol
 * @returns {Promise<object>}
 */
export async function fetchQuote(symbol) {
  const [dayData, yearData] = await Promise.all([
    fetchChart(symbol, '5d', '1d'),
    fetchChart(symbol, '1y', '1d'),
  ]);

  const meta = dayData.meta;
  const currentPrice = meta.regularMarketPrice ?? 0;
  const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? 0;
  const change = currentPrice - prevClose;
  const changePct = prevClose ? ((change / prevClose) * 100).toFixed(2) : 0;
  const direction = change >= 0 ? 'up' : 'down';

  const yearPrices = yearData.prices.filter((p) => p != null);
  const high52w = yearPrices.length ? Math.max(...yearPrices) : null;
  const low52w = yearPrices.length ? Math.min(...yearPrices) : null;

  return {
    symbol,
    fullName: meta.longName || meta.shortName || symbol,
    exchange: meta.exchangeName || 'NSE',
    currency: meta.currency || 'INR',
    price: currentPrice,
    prevClose,
    change,
    changePct: parseFloat(changePct),
    direction,
    stats: {
      range52w: high52w != null ? `₹${formatNum(low52w)} – ₹${formatNum(high52w)}` : '—',
      volume: formatVolume(meta.regularMarketVolume),
      marketCap: formatMarketCap(meta.marketCap),
      pe: 'N/A',
    },
  };
}

/** Map range tab labels to Yahoo Finance params */
export const RANGE_MAP = {
  '1D': { range: '1d', interval: '5m' },
  '1W': { range: '5d', interval: '15m' },
  '1M': { range: '1mo', interval: '1d' },
  '6M': { range: '6mo', interval: '1d' },
  '1Y': { range: '1y', interval: '1wk' },
  '5Y': { range: '5y', interval: '1mo' },
};

// ── Formatting helpers ──

function formatNum(n) {
  if (n == null) return '—';
  return n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function formatVolume(vol) {
  if (vol == null) return '—';
  if (vol >= 1e7) return (vol / 1e7).toFixed(1) + 'Cr';
  if (vol >= 1e5) return (vol / 1e5).toFixed(1) + 'L';
  if (vol >= 1e3) return (vol / 1e3).toFixed(1) + 'K';
  return vol.toString();
}

function formatMarketCap(cap) {
  if (cap == null) return '—';
  if (cap >= 1e12) return '₹' + (cap / 1e12).toFixed(1) + 'L Cr';
  if (cap >= 1e10) return '₹' + (cap / 1e10).toFixed(1) + 'K Cr';
  if (cap >= 1e7) return '₹' + (cap / 1e7).toFixed(1) + 'Cr';
  return '₹' + cap.toLocaleString('en-IN');
}
