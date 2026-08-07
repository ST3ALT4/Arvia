import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Panic-Trade Circuit Breaker
 * An emotional guardrail that intercepts panic-sell decisions during market dips.
 * Shows historical recovery data and enforces a 30-second cool-down period.
 */

/** Historical crash/correction recovery data for Indian markets */
const HISTORICAL_RECOVERIES = [
  { event: 'COVID Crash (Mar 2020)', drop: -38, recoveryDays: 145, niftyLow: 7511, niftyRecovery: 12200, year: 2020 },
  { event: 'IL&FS Crisis (Sep 2018)', drop: -17, recoveryDays: 210, niftyLow: 10004, niftyRecovery: 12100, year: 2018 },
  { event: 'Demonetization (Nov 2016)', drop: -8, recoveryDays: 42, niftyLow: 7916, niftyRecovery: 8600, year: 2016 },
  { event: 'China Slowdown (Aug 2015)', drop: -12, recoveryDays: 180, niftyLow: 7539, niftyRecovery: 8600, year: 2015 },
  { event: 'US Debt Downgrade (Aug 2011)', drop: -22, recoveryDays: 365, niftyLow: 4531, niftyRecovery: 5900, year: 2011 },
  { event: 'Global Financial Crisis (2008)', drop: -60, recoveryDays: 730, niftyLow: 2524, niftyRecovery: 6300, year: 2008 },
  { event: 'Dot-com Bust (2001)', drop: -36, recoveryDays: 540, niftyLow: 849, niftyRecovery: 1400, year: 2001 },
];

/** Simulated market scenarios for the demo */
const SCENARIOS = [
  {
    label: '📉 Flash Crash (-6%)',
    icon: '📉',
    dropPct: -6.2,
    holding: 'RELIANCE',
    holdingQty: 40,
    avgCost: 2810,
    currentPrice: 2636,
    headline: 'Nifty crashes 6% intraday on global recession fears. FIIs dump ₹12,000 Cr in a single session.',
    severity: 'critical',
  },
  {
    label: '⚠️ Sector Sell-off (-3.5%)',
    icon: '⚠️',
    dropPct: -3.5,
    holding: 'TCS',
    holdingQty: 15,
    avgCost: 3920,
    currentPrice: 3783,
    headline: 'IT sector hammered after weak US jobs data. Nifty IT index down 5.2%.',
    severity: 'high',
  },
  {
    label: '💹 Bad Earnings (-4.8%)',
    icon: '💹',
    dropPct: -4.8,
    holding: 'HDFCBANK',
    holdingQty: 60,
    avgCost: 1590,
    currentPrice: 1514,
    headline: 'HDFC Bank misses Q3 estimates. NII growth slows to 3.2% — lowest in 5 quarters.',
    severity: 'high',
  },
];

const COOLDOWN_SECONDS = 30;

/** Format currency in INR */
function fmtINR(n) {
  if (Math.abs(n) >= 100000) return (n < 0 ? '-' : '') + '₹' + (Math.abs(n) / 100000).toFixed(1) + 'L';
  return (n < 0 ? '-' : '') + '₹' + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

/** Behavioral nudge messages that rotate during cooldown */
const NUDGE_MESSAGES = [
  { text: "Warren Buffett: \"Be fearful when others are greedy, and greedy when others are fearful.\"", icon: "💡" },
  { text: "Historically, the Nifty 50 has ALWAYS recovered from every crash in its 30+ year history.", icon: "📊" },
  { text: "Panic selling locks in losses. Holding through volatility has rewarded patient investors 87% of the time.", icon: "🧘" },
  { text: "The worst trading days in history are often followed by the best trading days.", icon: "⚡" },
  { text: "₹1 lakh invested in Nifty in 2003 would be worth ₹18+ lakhs today — despite 5 major crashes.", icon: "🚀" },
  { text: "Your future self will thank you for not selling today.", icon: "🔮" },
];

export default function PanicCircuitBreaker() {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [cooldownComplete, setCooldownComplete] = useState(false);
  const [currentNudge, setCurrentNudge] = useState(0);
  const [decision, setDecision] = useState(null); // 'held' | 'sold'
  const timerRef = useRef(null);
  const nudgeRef = useRef(null);

  // Cooldown timer
  useEffect(() => {
    if (cooldownRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setCooldownRemaining((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timerRef.current);
    } else if (showModal && cooldownRemaining === 0 && !cooldownComplete && selectedScenario !== null) {
      setCooldownComplete(true);
    }
  }, [cooldownRemaining, showModal, cooldownComplete, selectedScenario]);

  // Rotate nudge messages every 5 seconds during cooldown
  useEffect(() => {
    if (showModal && cooldownRemaining > 0) {
      nudgeRef.current = setInterval(() => {
        setCurrentNudge((prev) => (prev + 1) % NUDGE_MESSAGES.length);
      }, 5000);
      return () => clearInterval(nudgeRef.current);
    }
  }, [showModal, cooldownRemaining]);

  const handleSellAttempt = useCallback((idx) => {
    setSelectedScenario(idx);
    setShowModal(true);
    setCooldownRemaining(COOLDOWN_SECONDS);
    setCooldownComplete(false);
    setDecision(null);
    setCurrentNudge(0);
  }, []);

  const handleDecision = (choice) => {
    setDecision(choice);
    setCooldownRemaining(0);
    if (nudgeRef.current) clearInterval(nudgeRef.current);
  };

  const handleReset = () => {
    setShowModal(false);
    setSelectedScenario(null);
    setCooldownRemaining(0);
    setCooldownComplete(false);
    setDecision(null);
    setCurrentNudge(0);
  };

  const scenario = selectedScenario !== null ? SCENARIOS[selectedScenario] : null;
  const unrealizedLoss = scenario ? (scenario.currentPrice - scenario.avgCost) * scenario.holdingQty : 0;
  const lossPct = scenario ? ((scenario.currentPrice - scenario.avgCost) / scenario.avgCost * 100).toFixed(1) : 0;

  // Average recovery for similar-sized drops
  const avgRecovery = HISTORICAL_RECOVERIES
    .filter(r => Math.abs(r.drop) >= Math.abs(scenario?.dropPct || 0) * 0.5)
    .reduce((sum, r, _, arr) => sum + r.recoveryDays / arr.length, 0);

  // Cooldown progress ring
  const ringRadius = 60;
  const ringStroke = 5;
  const ringNormalized = ringRadius - ringStroke;
  const ringCircumference = ringNormalized * 2 * Math.PI;
  const ringProgress = ringCircumference - (cooldownRemaining / COOLDOWN_SECONDS) * ringCircumference;

  return (
    <div className="breaker-section" id="panic-circuit-breaker">
      <div className="section-header">
        <div className="section-title">
          <span className="display">Panic-Trade Circuit Breaker</span>
          <span className="section-badge" style={{ background: 'var(--loss)', color: '#fff' }}>GUARDIAN</span>
        </div>
      </div>

      <p className="breaker-subtitle">
        Simulate a market crash scenario. When you try to panic-sell, the Guardian intercepts with a 30-second cool-down, historical recovery data, and behavioral nudges to protect you from emotional decisions.
      </p>

      {/* Scenario Cards */}
      {!showModal && (
        <div className="breaker-scenarios">
          <div className="breaker-scenarios-label">Choose a crash scenario to simulate:</div>
          <div className="breaker-scenarios-grid">
            {SCENARIOS.map((s, idx) => (
              <div key={idx} className="breaker-scenario-card" id={`scenario-${idx}`}>
                <div className="breaker-scenario-icon">{s.icon}</div>
                <div className="breaker-scenario-info">
                  <div className="breaker-scenario-name">{s.label}</div>
                  <div className="breaker-scenario-headline">{s.headline}</div>
                  <div className="breaker-scenario-holding">
                    You hold: <span className="mono">{s.holdingQty} × {s.holding}</span> @ <span className="mono">₹{s.avgCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="breaker-scenario-drop">
                    Current Price: <span className="mono down">₹{s.currentPrice.toLocaleString('en-IN')}</span>
                    <span className="breaker-drop-badge mono">{s.dropPct}%</span>
                  </div>
                </div>
                <button
                  className="breaker-sell-btn"
                  onClick={() => handleSellAttempt(idx)}
                >
                  🔴 SELL NOW
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Circuit Breaker Modal */}
      {showModal && scenario && (
        <div className="breaker-modal-overlay">
          <div className="breaker-modal">
            {/* Header with urgency */}
            <div className="breaker-modal-header">
              <div className="breaker-modal-shield">🛡️</div>
              <div>
                <div className="breaker-modal-title">Circuit Breaker Activated</div>
                <div className="breaker-modal-sub">Emotional sell attempt intercepted — take 30 seconds to review the facts</div>
              </div>
            </div>

            {/* What you're about to do */}
            <div className="breaker-action-card">
              <div className="breaker-action-label">You are about to sell:</div>
              <div className="breaker-action-detail">
                <span className="mono" style={{ fontSize: 16, fontWeight: 600 }}>{scenario.holdingQty} × {scenario.holding}</span>
                <span> at a </span>
                <span className="mono down" style={{ fontSize: 16, fontWeight: 700 }}>{lossPct}% loss</span>
              </div>
              <div className="breaker-action-loss">
                Unrealized Loss: <span className="mono down" style={{ fontWeight: 700 }}>{fmtINR(unrealizedLoss)}</span>
              </div>
              <div className="breaker-action-warn">
                ⚠️ Selling now <strong>locks in this loss permanently</strong>. You cannot undo it.
              </div>
            </div>

            {/* Cooldown Timer + Nudge */}
            {!decision && (
              <div className="breaker-cooldown-area">
                {cooldownRemaining > 0 ? (
                  <>
                    <div className="breaker-timer">
                      <svg height={ringRadius * 2} width={ringRadius * 2} className="breaker-timer-svg">
                        <circle
                          stroke="var(--surface-2)"
                          fill="transparent"
                          strokeWidth={ringStroke}
                          r={ringNormalized}
                          cx={ringRadius}
                          cy={ringRadius}
                        />
                        <circle
                          stroke="var(--loss)"
                          fill="transparent"
                          strokeWidth={ringStroke}
                          strokeLinecap="round"
                          strokeDasharray={`${ringCircumference} ${ringCircumference}`}
                          style={{
                            strokeDashoffset: ringProgress,
                            transition: 'stroke-dashoffset 1s linear',
                            filter: 'drop-shadow(0 0 6px var(--loss))',
                          }}
                          r={ringNormalized}
                          cx={ringRadius}
                          cy={ringRadius}
                          transform={`rotate(-90 ${ringRadius} ${ringRadius})`}
                        />
                      </svg>
                      <div className="breaker-timer-value">
                        <span className="breaker-timer-number mono">{cooldownRemaining}</span>
                        <span className="breaker-timer-label">seconds</span>
                      </div>
                    </div>
                    <div className="breaker-nudge">
                      <span className="breaker-nudge-icon">{NUDGE_MESSAGES[currentNudge].icon}</span>
                      <span className="breaker-nudge-text">{NUDGE_MESSAGES[currentNudge].text}</span>
                    </div>
                  </>
                ) : (
                  <div className="breaker-cooldown-done">
                    <div className="breaker-done-icon">✅</div>
                    <div className="breaker-done-text">Cool-down complete. You've had time to think. Now decide with a clear head.</div>
                  </div>
                )}
              </div>
            )}

            {/* Historical Recovery Data */}
            <div className="breaker-history-section">
              <div className="breaker-history-label">
                📊 Historical Recovery Data — Nifty 50 Crashes
              </div>
              <div className="breaker-history-avg">
                Average recovery from similar-sized drops: <span className="mono" style={{ color: 'var(--gain)', fontWeight: 600 }}>
                  {Math.round(avgRecovery)} days
                </span>
              </div>
              <div className="breaker-history-table">
                <table>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th className="th-right">Drop</th>
                      <th className="th-right">Recovery</th>
                      <th className="th-right">Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HISTORICAL_RECOVERIES.map((r, i) => (
                      <tr key={i}>
                        <td style={{ fontSize: 12 }}>{r.event}</td>
                        <td className="td-right mono down">{r.drop}%</td>
                        <td className="td-right mono">{r.recoveryDays < 365 ? `${r.recoveryDays} days` : `${(r.recoveryDays / 365).toFixed(1)} yrs`}</td>
                        <td className="td-right mono up">✅ Recovered</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="breaker-history-verdict">
                <strong>Every single crash in Nifty 50 history has fully recovered.</strong> Selling during a panic is historically the worst decision.
              </div>
            </div>

            {/* Decision Buttons */}
            {!decision && cooldownComplete && (
              <div className="breaker-decision-area">
                <button className="breaker-hold-btn" onClick={() => handleDecision('held')}>
                  💎 Hold — I'll stay the course
                </button>
                <button className="breaker-confirm-sell-btn" onClick={() => handleDecision('sold')}>
                  Still sell (lock in {fmtINR(unrealizedLoss)} loss)
                </button>
              </div>
            )}

            {/* Decision Outcome */}
            {decision && (
              <div className={`breaker-outcome ${decision}`}>
                {decision === 'held' ? (
                  <>
                    <div className="breaker-outcome-icon">💎</div>
                    <div className="breaker-outcome-title">Diamond Hands! You chose to hold.</div>
                    <div className="breaker-outcome-body">
                      If history repeats, your {scenario.holding} position would likely recover within ~{Math.round(avgRecovery)} days.
                      You've avoided locking in a {fmtINR(Math.abs(unrealizedLoss))} loss. Your future self thanks you.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="breaker-outcome-icon">📉</div>
                    <div className="breaker-outcome-title">You sold at a loss.</div>
                    <div className="breaker-outcome-body">
                      You locked in a permanent loss of {fmtINR(Math.abs(unrealizedLoss))}. In hindsight, {
                        ((HISTORICAL_RECOVERIES.filter(r => Math.abs(r.drop) >= Math.abs(scenario.dropPct) * 0.5).length / HISTORICAL_RECOVERIES.length) * 100).toFixed(0)
                      }% of similar historical crashes fully recovered. This is a simulation — in real life, this loss would be permanent.
                    </div>
                  </>
                )}
                <button className="breaker-reset-btn" onClick={handleReset}>
                  ↩ Try Another Scenario
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
