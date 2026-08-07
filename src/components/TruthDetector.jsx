import { useState, useCallback } from 'react';

/**
 * Truth Detector — FinFluencer & Scam Guard
 * Analyzes pasted financial advice text for red flags, hype patterns,
 * and unrealistic claims. Returns an Honesty Score with detailed breakdown.
 */

/** Red-flag patterns with severity weights */
const RED_FLAG_PATTERNS = [
  { pattern: /100\s*x|100x/gi, label: 'Claims 100x returns', severity: 'critical', points: 3 },
  { pattern: /guaranteed\s+(return|profit|income|gain)/gi, label: 'Guarantees returns (impossible)', severity: 'critical', points: 3 },
  { pattern: /risk\s*-?\s*free/gi, label: 'Claims risk-free investing', severity: 'critical', points: 3 },
  { pattern: /double\s+your\s+money/gi, label: 'Promises to double money', severity: 'critical', points: 3 },
  { pattern: /get\s+rich\s+quick/gi, label: 'Get rich quick mentality', severity: 'critical', points: 3 },
  { pattern: /secret\s+(stock|strategy|trick|method|formula)/gi, label: 'Secret stock/strategy claims', severity: 'high', points: 2 },
  { pattern: /limited\s+(time|seats|spots|offer)/gi, label: 'False urgency / scarcity tactic', severity: 'high', points: 2 },
  { pattern: /act\s+(now|fast|quickly|immediately)/gi, label: 'Pressure to act immediately', severity: 'high', points: 2 },
  { pattern: /insider\s+(tip|info|knowledge|trading)/gi, label: 'Claims insider information (illegal)', severity: 'critical', points: 3 },
  { pattern: /only\s+\d+\s*(people|investors|traders)/gi, label: 'Exclusivity pressure', severity: 'high', points: 2 },
  { pattern: /passive\s+income\s+guaranteed/gi, label: 'Guaranteed passive income', severity: 'critical', points: 3 },
  { pattern: /no\s+(experience|knowledge)\s+(needed|required)/gi, label: 'No experience needed claims', severity: 'medium', points: 1 },
  { pattern: /SEBI\s+registered.*free/gi, label: 'Misusing SEBI registration', severity: 'high', points: 2 },
  { pattern: /join\s+(my|our)\s+(telegram|whatsapp|channel|group)/gi, label: 'Social group pump scheme', severity: 'high', points: 2 },
  { pattern: /multi\s*-?\s*bagger/gi, label: 'Multi-bagger hype', severity: 'medium', points: 1 },
  { pattern: /penny\s+stock/gi, label: 'Penny stock promotion', severity: 'medium', points: 1 },
  { pattern: /sure\s*-?\s*shot/gi, label: 'Sure-shot tip claims', severity: 'high', points: 2 },
  { pattern: /rocket.*moon|to\s+the\s+moon/gi, label: 'Hype language (to the moon)', severity: 'medium', points: 1 },
  { pattern: /\b\d{2,4}\s*%\s*(return|profit|gain)/gi, label: 'Unrealistic % return claims', severity: 'high', points: 2 },
  { pattern: /free\s+(tips?|calls?|signals?)/gi, label: 'Free tips (usually paid upsell)', severity: 'medium', points: 1 },
];

/** Positive / trust signals */
const TRUST_PATTERNS = [
  { pattern: /risk/gi, label: 'Mentions risk', trust: 1 },
  { pattern: /diversif/gi, label: 'Mentions diversification', trust: 1 },
  { pattern: /long\s*-?\s*term/gi, label: 'Long-term perspective', trust: 1 },
  { pattern: /SIP|systematic\s+investment/gi, label: 'Mentions SIP / systematic investing', trust: 1 },
  { pattern: /expense\s+ratio/gi, label: 'Mentions expense ratio', trust: 1 },
  { pattern: /CAGR/gi, label: 'Uses proper metric (CAGR)', trust: 1 },
  { pattern: /fundamental|technical\s+analysis/gi, label: 'References proper analysis', trust: 1 },
  { pattern: /past\s+performance.*guarantee/gi, label: 'Proper disclaimers', trust: 2 },
  { pattern: /consult.*financial\s+(advisor|planner)/gi, label: 'Suggests consulting advisor', trust: 2 },
  { pattern: /SEBI/gi, label: 'References SEBI', trust: 1 },
];

function analyzeText(text) {
  if (!text || text.trim().length < 10) return null;

  const flags = [];
  let totalPenalty = 0;
  RED_FLAG_PATTERNS.forEach((rf) => {
    const matches = text.match(rf.pattern);
    if (matches) {
      flags.push({ ...rf, count: matches.length });
      totalPenalty += rf.points * matches.length;
    }
  });

  const trusts = [];
  let totalTrust = 0;
  TRUST_PATTERNS.forEach((tp) => {
    if (tp.pattern.test(text)) {
      trusts.push(tp);
      totalTrust += tp.trust;
    }
  });

  // Score: start at 10, subtract penalties, add trust
  let score = 10 - totalPenalty + totalTrust;
  score = Math.max(1, Math.min(10, Math.round(score)));

  // Word count analysis
  const wordCount = text.split(/\s+/).length;
  const exclamations = (text.match(/!/g) || []).length;
  const capsWords = (text.match(/\b[A-Z]{3,}\b/g) || []).filter(w => !['THE', 'AND', 'FOR', 'SIP', 'NSE', 'BSE', 'SEBI', 'CAGR', 'IPO', 'ETF', 'MF', 'NAV', 'AMC'].includes(w)).length;

  const warnings = [];
  if (exclamations > 3) warnings.push({ text: `${exclamations} exclamation marks — excessive hype language`, severity: 'medium' });
  if (capsWords > 5) warnings.push({ text: `${capsWords} SHOUTING words in caps — manipulative formatting`, severity: 'medium' });
  if (wordCount < 20 && flags.length > 0) warnings.push({ text: 'Very short message with red flags — likely a pump message', severity: 'high' });

  return { score, flags, trusts, warnings, wordCount, exclamations, capsWords };
}

const SEVERITY_COLORS = {
  critical: 'var(--loss)',
  high: '#e67e22',
  medium: 'var(--accent)',
};

const SEVERITY_BG = {
  critical: 'var(--loss-soft)',
  high: 'rgba(230, 126, 34, 0.12)',
  medium: 'var(--accent-soft)',
};

function ScoreRing({ score }) {
  const radius = 54;
  const stroke = 6;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 10) * circumference;

  let color = 'var(--loss)';
  if (score >= 7) color = 'var(--gain)';
  else if (score >= 4) color = 'var(--accent)';

  return (
    <div className="score-ring-container">
      <svg height={radius * 2} width={radius * 2} className="score-ring-svg">
        <circle
          stroke="var(--border)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-out', filter: `drop-shadow(0 0 6px ${color})` }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          transform={`rotate(-90 ${radius} ${radius})`}
        />
      </svg>
      <div className="score-ring-value" style={{ color }}>
        <span className="score-ring-number mono">{score}</span>
        <span className="score-ring-label">/10</span>
      </div>
    </div>
  );
}

const SAMPLE_TEXTS = [
  {
    label: '🚨 Scam Tip',
    text: `🔥🔥 SECRET STOCK TIP 🔥🔥\nThis penny stock is going to 100x!! Guaranteed returns of 500% in just 3 months! Only 50 people will get this insider tip. Join my Telegram group NOW and double your money! Act fast — limited time offer!! No experience needed. Risk-free profits guaranteed!!!`,
  },
  {
    label: '✅ Balanced Advice',
    text: `If you're a beginner, I'd recommend starting with a monthly SIP in a broad market index fund like Nifty 50. The expense ratio matters — look for direct plans under 0.5%. Remember, past performance doesn't guarantee future results. Diversification across asset classes helps manage risk. Historically, the Nifty has delivered around 12-14% CAGR over 15+ years, but short-term volatility is normal. Always consult a SEBI registered financial advisor before making investment decisions.`,
  },
  {
    label: '⚠️ Subtle Hype',
    text: `This multi-bagger stock has been my best pick this year! It returned 200% profit and I think it can go to the moon! Sure-shot buy at current levels. My premium Telegram group has been giving amazing calls — free tips for the first 100 members only!`,
  },
];

export default function TruthDetector() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = useCallback(() => {
    if (!inputText.trim()) return;
    setAnalyzing(true);
    // Simulate a brief processing delay for UX feedback
    setTimeout(() => {
      setResult(analyzeText(inputText));
      setAnalyzing(false);
    }, 600);
  }, [inputText]);

  const handleSample = (text) => {
    setInputText(text);
    setResult(null);
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
  };

  return (
    <div className="truth-section" id="truth-detector">
      <div className="section-header">
        <div className="section-title">
          <span className="display">Truth Detector</span>
          <span className="section-badge" style={{ background: 'var(--loss)', color: '#fff' }}>SCAM GUARD</span>
        </div>
      </div>

      <p className="truth-subtitle">
        Paste any stock tip, financial advice, or FinFluencer post below. We'll scan it for red flags, hype patterns, and unrealistic claims.
      </p>

      {/* Sample buttons */}
      <div className="truth-samples">
        {SAMPLE_TEXTS.map((s) => (
          <button key={s.label} className="truth-sample-btn" onClick={() => handleSample(s.text)}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="truth-input-wrap">
        <textarea
          className="truth-textarea"
          placeholder="Paste a stock tip, financial advice, YouTube video description, WhatsApp message, or policy document text here..."
          value={inputText}
          onChange={(e) => { setInputText(e.target.value); setResult(null); }}
          rows={6}
          id="truth-input"
        />
        <div className="truth-input-actions">
          <span className="truth-char-count mono">{inputText.length} chars</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {inputText && (
              <button className="truth-clear-btn" onClick={handleClear}>Clear</button>
            )}
            <button
              className="truth-analyze-btn"
              onClick={handleAnalyze}
              disabled={!inputText.trim() || analyzing}
              id="truth-analyze"
            >
              {analyzing ? (
                <><span className="truth-spinner" /> Analyzing…</>
              ) : (
                '🔍 Analyze'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="truth-results" id="truth-results">
          {/* Score */}
          <div className="truth-score-card">
            <ScoreRing score={result.score} />
            <div className="truth-score-info">
              <div className="truth-score-title">
                {result.score >= 7 ? 'Looks Legitimate' : result.score >= 4 ? 'Proceed with Caution' : 'Likely Misleading / Scam'}
              </div>
              <div className="truth-score-sub">
                {result.flags.length} red flag{result.flags.length !== 1 ? 's' : ''} · {result.trusts.length} trust signal{result.trusts.length !== 1 ? 's' : ''} · {result.wordCount} words analyzed
              </div>
            </div>
          </div>

          {/* Red Flags */}
          {result.flags.length > 0 && (
            <div className="truth-flags-section">
              <div className="truth-flags-label">🚩 Red Flags Found</div>
              <div className="truth-flags-list">
                {result.flags.map((f, i) => (
                  <div key={i} className="truth-flag-item" style={{ borderLeftColor: SEVERITY_COLORS[f.severity] }}>
                    <div className="truth-flag-badge" style={{ background: SEVERITY_BG[f.severity], color: SEVERITY_COLORS[f.severity] }}>
                      {f.severity.toUpperCase()}
                    </div>
                    <span>{f.label}</span>
                    {f.count > 1 && <span className="mono" style={{ color: 'var(--text-dim)', fontSize: 11 }}>×{f.count}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Warnings */}
          {result.warnings.length > 0 && (
            <div className="truth-flags-section">
              <div className="truth-flags-label">⚠️ Additional Warnings</div>
              <div className="truth-flags-list">
                {result.warnings.map((w, i) => (
                  <div key={i} className="truth-flag-item" style={{ borderLeftColor: SEVERITY_COLORS[w.severity] }}>
                    <div className="truth-flag-badge" style={{ background: SEVERITY_BG[w.severity], color: SEVERITY_COLORS[w.severity] }}>
                      {w.severity.toUpperCase()}
                    </div>
                    <span>{w.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust Signals */}
          {result.trusts.length > 0 && (
            <div className="truth-flags-section">
              <div className="truth-flags-label">✅ Trust Signals</div>
              <div className="truth-flags-list">
                {result.trusts.map((t, i) => (
                  <div key={i} className="truth-trust-item">
                    <span style={{ color: 'var(--gain)' }}>✓</span>
                    <span>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="truth-disclaimer">
            This analysis uses pattern matching and heuristics. It is not a substitute for professional financial advice. Always verify claims independently and consult a SEBI-registered advisor.
          </div>
        </div>
      )}
    </div>
  );
}
