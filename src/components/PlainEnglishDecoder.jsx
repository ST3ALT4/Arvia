import { useState, useMemo } from 'react';

/**
 * Translates raw financial metrics into plain-English metaphors
 * with a traffic-light health badge system.
 */

const METRIC_TRANSLATORS = [
  {
    key: 'pe',
    label: 'P/E Ratio',
    plainLabel: 'Years to earn back your money',
    icon: '⏳',
    translate: (val) => {
      const n = parseFloat(val);
      if (isNaN(n)) return { text: 'Not available for this stock', health: 'neutral' };
      if (n < 0) return { text: `This company is losing money right now — it would take forever to earn back your investment at current rates.`, health: 'red' };
      if (n <= 15) return { text: `If this company gave you ALL its profits, you'd earn your money back in ~${Math.round(n)} years. That's considered cheap & fast.`, health: 'green' };
      if (n <= 30) return { text: `It would take ~${Math.round(n)} years of profits to pay back your investment. That's average — not cheap, not expensive.`, health: 'yellow' };
      return { text: `You'd wait ~${Math.round(n)} years to earn your money back from profits alone. That's expensive — people are betting hard on future growth.`, health: 'red' };
    },
  },
  {
    key: 'marketCap',
    label: 'Market Cap',
    plainLabel: 'How big is this company?',
    icon: '🏢',
    translate: (val) => {
      if (!val || val === '—') return { text: 'Size data not available', health: 'neutral' };
      const str = val.replace('₹', '').trim();
      if (str.includes('L Cr')) {
        const num = parseFloat(str);
        if (num >= 10) return { text: `This is a mega-giant — worth ₹${str}. Think Reliance, TCS level. Very stable, unlikely to disappear overnight.`, health: 'green' };
        return { text: `This is a large company worth ₹${str}. Well-established with a solid track record.`, health: 'green' };
      }
      if (str.includes('K Cr')) {
        const num = parseFloat(str);
        if (num >= 50) return { text: `This is a large-cap company worth ₹${str}. Big enough to be stable, but still has room to grow.`, health: 'green' };
        if (num >= 10) return { text: `A mid-cap company worth ₹${str}. Has potential to grow significantly, but carries more risk than blue-chips.`, health: 'yellow' };
        return { text: `A smaller company worth ₹${str}. Could give high returns, but also higher risk — do your homework.`, health: 'yellow' };
      }
      if (str.includes('Cr')) {
        return { text: `A small company worth ₹${str}. High risk, high potential reward. Not for the faint-hearted.`, health: 'red' };
      }
      return { text: `Company is worth ${val}`, health: 'neutral' };
    },
  },
  {
    key: 'volume',
    label: 'Volume (Today)',
    plainLabel: 'How actively is it being traded?',
    icon: '📊',
    translate: (val) => {
      if (!val || val === '—') return { text: 'Volume data not available', health: 'neutral' };
      const str = val.replace(/,/g, '');
      let num = 0;
      if (str.includes('Cr')) num = parseFloat(str) * 10000000;
      else if (str.includes('L')) num = parseFloat(str) * 100000;
      else if (str.includes('K')) num = parseFloat(str) * 1000;
      else if (str.includes('M')) num = parseFloat(str) * 1000000;
      else num = parseFloat(str);

      if (num >= 10000000) return { text: `${val} shares traded today — that's extremely active. Lots of people are buying and selling, so you can enter or exit easily.`, health: 'green' };
      if (num >= 1000000) return { text: `${val} shares traded today — decent activity. You shouldn't have trouble buying or selling.`, health: 'green' };
      if (num >= 100000) return { text: `${val} shares traded — moderate activity. Be careful with large orders, they might move the price.`, health: 'yellow' };
      return { text: `Only ${val} shares traded — very low activity. Buying or selling large amounts could be difficult.`, health: 'red' };
    },
  },
  {
    key: 'range52w',
    label: '52-Week Range',
    plainLabel: 'Where is the price compared to its yearly high/low?',
    icon: '📈',
    translate: (val, extra) => {
      if (!val || val === '—') return { text: 'Range data not available', health: 'neutral' };
      // Try to parse "₹X – ₹Y"
      const parts = val.replace(/₹/g, '').replace(/,/g, '').split('–').map(s => parseFloat(s.trim()));
      if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) {
        return { text: `The stock has traded between ${val} this past year.`, health: 'neutral' };
      }
      const [low, high] = parts;
      const price = extra?.price;
      if (!price) return { text: `This year, the stock ranged from ₹${low.toLocaleString('en-IN')} to ₹${high.toLocaleString('en-IN')}.`, health: 'neutral' };

      const range = high - low;
      const position = range > 0 ? ((price - low) / range) * 100 : 50;

      if (position >= 85) return { text: `Trading near its yearly HIGH (top 15%). The stock is expensive right now compared to where it's been. Could still go higher, but there's limited upside based on history.`, health: 'red' };
      if (position >= 60) return { text: `Sitting in the upper half of its yearly range. Healthy territory — not at the peak, still has room.`, health: 'green' };
      if (position >= 30) return { text: `In the middle of its yearly range. Neither cheap nor expensive — a neutral zone.`, health: 'yellow' };
      return { text: `Trading near its yearly LOW (bottom 30%). Could be a bargain or could mean something is wrong. Investigate why it fell.`, health: 'yellow' };
    },
  },
  {
    key: 'dayChange',
    label: "Today's Change",
    plainLabel: 'How did it do today?',
    icon: '📅',
    translate: (val, extra) => {
      const pct = extra?.changePct;
      if (pct == null) return { text: 'Change data not available', health: 'neutral' };
      const n = parseFloat(pct);
      if (n >= 3) return { text: `Up ${Math.abs(n).toFixed(2)}% today — a strong rally! But don't buy just because it's going up. Check WHY.`, health: 'green' };
      if (n >= 0.5) return { text: `Up ${Math.abs(n).toFixed(2)}% today — a healthy positive day. Nothing dramatic.`, health: 'green' };
      if (n >= -0.5) return { text: `Basically flat today (${n >= 0 ? '+' : ''}${n.toFixed(2)}%). The market is undecided on this stock.`, health: 'neutral' };
      if (n >= -3) return { text: `Down ${Math.abs(n).toFixed(2)}% today — a red day, but nothing unusual. Don't panic.`, health: 'yellow' };
      return { text: `Down ${Math.abs(n).toFixed(2)}% today — a significant drop. Check if there's a reason (bad news, sector-wide sell-off, or just market noise).`, health: 'red' };
    },
  },
];

/** Overall health score based on individual metric healths */
function computeOverallHealth(results) {
  const weights = { green: 2, yellow: 1, red: 0, neutral: 1 };
  const scored = results.filter(r => r.health !== 'neutral');
  if (scored.length === 0) return { label: 'Insufficient Data', color: 'var(--text-dim)', emoji: '❓' };
  const avg = scored.reduce((s, r) => s + weights[r.health], 0) / scored.length;
  if (avg >= 1.5) return { label: 'Looking Healthy', color: 'var(--gain)', emoji: '✅' };
  if (avg >= 0.8) return { label: 'Mixed Signals', color: 'var(--accent)', emoji: '⚠️' };
  return { label: 'Caution Needed', color: 'var(--loss)', emoji: '🚨' };
}

const HEALTH_COLORS = {
  green: 'var(--gain)',
  yellow: 'var(--accent)',
  red: 'var(--loss)',
  neutral: 'var(--text-dim)',
};

const HEALTH_BG = {
  green: 'var(--gain-soft)',
  yellow: 'var(--accent-soft)',
  red: 'var(--loss-soft)',
  neutral: 'var(--surface-2)',
};

export default function PlainEnglishDecoder({ quote }) {
  const [expanded, setExpanded] = useState(null);

  const results = useMemo(() => {
    if (!quote) return [];
    return METRIC_TRANSLATORS.map((m) => {
      let rawValue;
      const extra = { price: quote.price, changePct: quote.changePct };
      switch (m.key) {
        case 'pe': rawValue = quote.stats?.pe; break;
        case 'marketCap': rawValue = quote.stats?.marketCap; break;
        case 'volume': rawValue = quote.stats?.volume; break;
        case 'range52w': rawValue = quote.stats?.range52w; break;
        case 'dayChange': rawValue = quote.changePct; break;
        default: rawValue = null;
      }
      const result = m.translate(rawValue, extra);
      return { ...m, ...result, rawValue };
    });
  }, [quote]);

  const overall = useMemo(() => computeOverallHealth(results), [results]);

  if (!quote) {
    return (
      <div className="decoder-section" id="plain-english-decoder">
        <div className="section-header">
          <div className="section-title">
            <span className="display">Plain English Decoder</span>
            <span className="section-badge">COMMON MAN</span>
          </div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center', padding: '32px' }}>
          <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>
            Select a stock to see the plain-English breakdown
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="decoder-section" id="plain-english-decoder">
      {/* Header */}
      <div className="section-header">
        <div className="section-title">
          <span className="display">Plain English Decoder</span>
          <span className="section-badge">COMMON MAN</span>
        </div>
      </div>

      {/* Overall Health Banner */}
      <div className="decoder-health-banner" style={{ borderLeftColor: overall.color }}>
        <span className="decoder-health-emoji">{overall.emoji}</span>
        <div>
          <div className="decoder-health-label" style={{ color: overall.color }}>{overall.label}</div>
          <div className="decoder-health-sub">
            Based on {results.filter(r => r.health !== 'neutral').length} key metrics analyzed in simple terms
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="decoder-grid">
        {results.map((r) => (
          <div
            key={r.key}
            className={`decoder-card${expanded === r.key ? ' expanded' : ''}`}
            onClick={() => setExpanded(expanded === r.key ? null : r.key)}
          >
            <div className="decoder-card-header">
              <div className="decoder-card-icon">{r.icon}</div>
              <div className="decoder-card-titles">
                <div className="decoder-card-plain-label">{r.plainLabel}</div>
                <div className="decoder-card-tech-label">{r.label}: <span className="mono">{r.rawValue ?? '—'}</span></div>
              </div>
              <div
                className="decoder-health-dot"
                style={{ background: HEALTH_COLORS[r.health], boxShadow: `0 0 8px ${HEALTH_COLORS[r.health]}` }}
                title={r.health}
              />
            </div>
            <div className="decoder-card-body" style={{ background: HEALTH_BG[r.health] }}>
              <p>{r.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
