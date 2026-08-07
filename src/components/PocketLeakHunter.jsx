import { useState, useMemo } from 'react';

/**
 * Silent Pocket-Leak Hunter
 * Analyzes sample financial data to find hidden fees, unused subscriptions,
 * and costly mutual fund commission leakage.
 */

/** Sample bank statement transactions for demonstration */
const SAMPLE_STATEMENTS = [
  {
    label: 'Typical Salaried Professional',
    icon: '💼',
    data: {
      subscriptions: [
        { name: 'Netflix Premium', amount: 649, lastUsed: 45, category: 'Entertainment' },
        { name: 'Spotify Family', amount: 179, lastUsed: 5, category: 'Music' },
        { name: 'Amazon Prime', amount: 299, lastUsed: 12, category: 'Shopping' },
        { name: 'LinkedIn Premium', amount: 1499, lastUsed: 90, category: 'Career' },
        { name: 'Gym Membership', amount: 2500, lastUsed: 62, category: 'Fitness' },
        { name: 'Cloud Storage (iCloud)', amount: 75, lastUsed: 3, category: 'Utility' },
        { name: 'YouTube Premium', amount: 149, lastUsed: 2, category: 'Entertainment' },
        { name: 'Coursera Plus', amount: 3299, lastUsed: 120, category: 'Education' },
      ],
      mutualFunds: [
        { name: 'HDFC Flexi Cap Fund - Regular', invested: 500000, expenseRatio: 1.74, directExpenseRatio: 0.77 },
        { name: 'SBI Blue Chip Fund - Regular', invested: 300000, expenseRatio: 1.62, directExpenseRatio: 0.82 },
        { name: 'ICICI Pru Balanced Advantage - Regular', invested: 200000, expenseRatio: 1.55, directExpenseRatio: 0.92 },
        { name: 'Axis ELSS Tax Saver - Regular', invested: 150000, expenseRatio: 1.69, directExpenseRatio: 0.63 },
      ],
      bankFees: [
        { name: 'SMS Alert Charges', amount: 25, frequency: 'quarterly', annual: 100 },
        { name: 'Debit Card Annual Fee', amount: 500, frequency: 'annual', annual: 500 },
        { name: 'Min Balance Penalty', amount: 600, frequency: 'quarterly', annual: 2400 },
        { name: 'NEFT/IMPS Charges', amount: 15, frequency: 'monthly', annual: 180 },
      ],
      insurance: [
        { name: 'LIC Endowment Plan', premium: 48000, sumAssured: 1000000, effectiveCover: '~20x', isBundled: true, issue: 'Low return (~5% IRR). Pure term insurance gives 50x cover at ₹12,000/yr.' },
        { name: 'HDFC ERGO Health Top-up', premium: 4500, sumAssured: 500000, isBundled: false, issue: null },
      ],
    },
  },
  {
    label: 'Young Investor',
    icon: '🎓',
    data: {
      subscriptions: [
        { name: 'Netflix Basic', amount: 199, lastUsed: 8, category: 'Entertainment' },
        { name: 'Spotify Individual', amount: 119, lastUsed: 1, category: 'Music' },
        { name: 'ChatGPT Plus', amount: 1680, lastUsed: 3, category: 'AI Tools' },
        { name: 'Canva Pro', amount: 499, lastUsed: 75, category: 'Design' },
        { name: 'Gaming (Game Pass)', amount: 449, lastUsed: 40, category: 'Gaming' },
      ],
      mutualFunds: [
        { name: 'Parag Parikh Flexi Cap - Regular', invested: 100000, expenseRatio: 1.33, directExpenseRatio: 0.63 },
        { name: 'Mirae Asset Large Cap - Regular', invested: 80000, expenseRatio: 1.59, directExpenseRatio: 0.53 },
      ],
      bankFees: [
        { name: 'SMS Alert Charges', amount: 25, frequency: 'quarterly', annual: 100 },
        { name: 'ATM Withdrawal Excess', amount: 21, frequency: 'monthly', annual: 252 },
      ],
      insurance: [],
    },
  },
];

/** Categorize leaks */
function analyzeLeaks(data) {
  const results = { subscriptions: [], mutualFunds: [], bankFees: [], insurance: [], totalAnnual: 0 };

  // Subscriptions — flag if not used in 30+ days
  data.subscriptions.forEach((sub) => {
    const isUnused = sub.lastUsed > 30;
    const annualCost = sub.amount * 12;
    if (isUnused) {
      results.subscriptions.push({
        ...sub,
        annualCost,
        status: sub.lastUsed > 60 ? 'ghost' : 'dormant',
        statusLabel: sub.lastUsed > 60 ? 'Ghost Subscription' : 'Barely Used',
        savings: annualCost,
      });
      results.totalAnnual += annualCost;
    }
  });

  // Mutual Fund expense leak — Regular vs Direct
  data.mutualFunds.forEach((mf) => {
    const leak = mf.expenseRatio - mf.directExpenseRatio;
    const annualLeak = Math.round((leak / 100) * mf.invested);
    results.mutualFunds.push({
      ...mf,
      leakPct: leak,
      annualLeak,
    });
    results.totalAnnual += annualLeak;
  });

  // Bank fees
  data.bankFees.forEach((fee) => {
    results.bankFees.push({ ...fee });
    results.totalAnnual += fee.annual;
  });

  // Insurance — flag bundled/low-return policies
  data.insurance.forEach((ins) => {
    if (ins.isBundled && ins.issue) {
      const potentialSaving = ins.premium - 12000; // compared to pure term
      results.insurance.push({ ...ins, potentialSaving: Math.max(0, potentialSaving) });
      results.totalAnnual += Math.max(0, potentialSaving);
    }
  });

  return results;
}

function formatCurrency(amount) {
  if (amount >= 100000) return '₹' + (amount / 100000).toFixed(1) + 'L';
  if (amount >= 1000) return '₹' + (amount / 1000).toFixed(1) + 'K';
  return '₹' + amount.toLocaleString('en-IN');
}

export default function PocketLeakHunter() {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const analysis = useMemo(() => {
    if (selectedProfile === null) return null;
    return analyzeLeaks(SAMPLE_STATEMENTS[selectedProfile].data);
  }, [selectedProfile]);

  const handleScan = (idx) => {
    setSelectedProfile(idx);
    setShowResults(false);
    setScanning(true);
    // Simulate scanning with progress effect
    setTimeout(() => {
      setScanning(false);
      setShowResults(true);
    }, 1200);
  };

  const categories = [
    { key: 'all', label: 'All Leaks', icon: '📋' },
    { key: 'subscriptions', label: 'Subscriptions', icon: '🔄' },
    { key: 'mutualFunds', label: 'MF Commission', icon: '📉' },
    { key: 'bankFees', label: 'Bank Fees', icon: '🏦' },
    { key: 'insurance', label: 'Insurance', icon: '🛡️' },
  ];

  return (
    <div className="leak-section" id="pocket-leak-hunter">
      <div className="section-header">
        <div className="section-title">
          <span className="display">Pocket-Leak Hunter</span>
          <span className="section-badge" style={{ background: '#e67e22', color: '#fff' }}>SAVINGS</span>
        </div>
      </div>

      <p className="leak-subtitle">
        Find money you're unknowingly losing every month — ghost subscriptions, hidden mutual fund commissions, and avoidable bank charges.
      </p>

      {/* Profile Selection */}
      <div className="leak-profiles">
        <div className="leak-profiles-label">Select a sample profile to scan:</div>
        <div className="leak-profiles-grid">
          {SAMPLE_STATEMENTS.map((profile, idx) => (
            <button
              key={idx}
              className={`leak-profile-card${selectedProfile === idx ? ' active' : ''}`}
              onClick={() => handleScan(idx)}
              id={`leak-profile-${idx}`}
            >
              <span className="leak-profile-icon">{profile.icon}</span>
              <span className="leak-profile-name">{profile.label}</span>
              <span className="leak-profile-meta">
                {profile.data.subscriptions.length} subs · {profile.data.mutualFunds.length} MFs
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Scanning Animation */}
      {scanning && (
        <div className="leak-scanning">
          <div className="leak-scan-bar">
            <div className="leak-scan-progress" />
          </div>
          <div className="leak-scan-text">Scanning for hidden leaks…</div>
        </div>
      )}

      {/* Results */}
      {showResults && analysis && (
        <div className="leak-results">
          {/* Total Savings Banner */}
          <div className="leak-total-banner">
            <div className="leak-total-left">
              <div className="leak-total-label">Total Money Reclaimable Per Year</div>
              <div className="leak-total-amount mono">{formatCurrency(analysis.totalAnnual)}</div>
              <div className="leak-total-sub">
                That's <span className="mono" style={{ color: 'var(--accent)' }}>
                  {formatCurrency(Math.round(analysis.totalAnnual / 12))}
                </span> every month going to waste
              </div>
            </div>
            <div className="leak-total-right">
              <div className="leak-total-breakdown">
                {analysis.subscriptions.length > 0 && (
                  <div className="leak-breakdown-item">
                    <span className="leak-breakdown-dot" style={{ background: 'var(--loss)' }} />
                    <span>Subscriptions: {formatCurrency(analysis.subscriptions.reduce((s, x) => s + x.savings, 0))}</span>
                  </div>
                )}
                {analysis.mutualFunds.length > 0 && (
                  <div className="leak-breakdown-item">
                    <span className="leak-breakdown-dot" style={{ background: 'var(--accent)' }} />
                    <span>MF Commission: {formatCurrency(analysis.mutualFunds.reduce((s, x) => s + x.annualLeak, 0))}</span>
                  </div>
                )}
                {analysis.bankFees.length > 0 && (
                  <div className="leak-breakdown-item">
                    <span className="leak-breakdown-dot" style={{ background: '#e67e22' }} />
                    <span>Bank Fees: {formatCurrency(analysis.bankFees.reduce((s, x) => s + x.annual, 0))}</span>
                  </div>
                )}
                {analysis.insurance.length > 0 && (
                  <div className="leak-breakdown-item">
                    <span className="leak-breakdown-dot" style={{ background: '#9b59b6' }} />
                    <span>Insurance: {formatCurrency(analysis.insurance.reduce((s, x) => s + x.potentialSaving, 0))}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="leak-category-tabs">
            {categories.map((cat) => {
              const count = cat.key === 'all'
                ? analysis.subscriptions.length + analysis.mutualFunds.length + analysis.bankFees.length + analysis.insurance.length
                : (analysis[cat.key]?.length || 0);
              if (cat.key !== 'all' && count === 0) return null;
              return (
                <button
                  key={cat.key}
                  className={`leak-cat-tab${activeCategory === cat.key ? ' active' : ''}`}
                  onClick={() => setActiveCategory(cat.key)}
                >
                  {cat.icon} {cat.label}
                  <span className="leak-cat-count mono">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Subscriptions */}
          {(activeCategory === 'all' || activeCategory === 'subscriptions') && analysis.subscriptions.length > 0 && (
            <div className="leak-category-section">
              <div className="leak-cat-header">
                <span>🔄 Ghost & Dormant Subscriptions</span>
                <span className="leak-cat-total mono" style={{ color: 'var(--loss)' }}>
                  {formatCurrency(analysis.subscriptions.reduce((s, x) => s + x.savings, 0))}/yr wasted
                </span>
              </div>
              {analysis.subscriptions.map((sub, i) => (
                <div key={i} className="leak-item">
                  <div className="leak-item-left">
                    <div className="leak-item-name">{sub.name}</div>
                    <div className="leak-item-meta">
                      <span className={`leak-status-badge ${sub.status}`}>
                        {sub.statusLabel}
                      </span>
                      <span>Last used {sub.lastUsed} days ago</span>
                      <span>· {sub.category}</span>
                    </div>
                  </div>
                  <div className="leak-item-right">
                    <div className="leak-item-amount mono">₹{sub.amount}/mo</div>
                    <div className="leak-item-annual mono" style={{ color: 'var(--loss)' }}>
                      {formatCurrency(sub.annualCost)}/yr
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mutual Fund Commission Leak */}
          {(activeCategory === 'all' || activeCategory === 'mutualFunds') && analysis.mutualFunds.length > 0 && (
            <div className="leak-category-section">
              <div className="leak-cat-header">
                <span>📉 Mutual Fund Commission Leakage (Regular → Direct)</span>
                <span className="leak-cat-total mono" style={{ color: 'var(--accent)' }}>
                  {formatCurrency(analysis.mutualFunds.reduce((s, x) => s + x.annualLeak, 0))}/yr leaked
                </span>
              </div>
              <div className="leak-mf-info">
                💡 Switching from Regular to Direct plans eliminates distributor commission. Same fund, same portfolio — just lower fees.
              </div>
              {analysis.mutualFunds.map((mf, i) => (
                <div key={i} className="leak-item">
                  <div className="leak-item-left">
                    <div className="leak-item-name">{mf.name}</div>
                    <div className="leak-item-meta">
                      <span>Invested: <span className="mono">{formatCurrency(mf.invested)}</span></span>
                      <span>· Regular: <span className="mono" style={{ color: 'var(--loss)' }}>{mf.expenseRatio}%</span></span>
                      <span>→ Direct: <span className="mono" style={{ color: 'var(--gain)' }}>{mf.directExpenseRatio}%</span></span>
                    </div>
                  </div>
                  <div className="leak-item-right">
                    <div className="leak-item-amount mono" style={{ color: 'var(--loss)' }}>
                      -{mf.leakPct.toFixed(2)}%
                    </div>
                    <div className="leak-item-annual mono" style={{ color: 'var(--accent)' }}>
                      {formatCurrency(mf.annualLeak)}/yr
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bank Fees */}
          {(activeCategory === 'all' || activeCategory === 'bankFees') && analysis.bankFees.length > 0 && (
            <div className="leak-category-section">
              <div className="leak-cat-header">
                <span>🏦 Avoidable Bank Charges</span>
                <span className="leak-cat-total mono" style={{ color: '#e67e22' }}>
                  {formatCurrency(analysis.bankFees.reduce((s, x) => s + x.annual, 0))}/yr
                </span>
              </div>
              {analysis.bankFees.map((fee, i) => (
                <div key={i} className="leak-item">
                  <div className="leak-item-left">
                    <div className="leak-item-name">{fee.name}</div>
                    <div className="leak-item-meta">
                      <span>₹{fee.amount} {fee.frequency}</span>
                    </div>
                  </div>
                  <div className="leak-item-right">
                    <div className="leak-item-annual mono" style={{ color: '#e67e22' }}>
                      {formatCurrency(fee.annual)}/yr
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Insurance */}
          {(activeCategory === 'all' || activeCategory === 'insurance') && analysis.insurance.length > 0 && (
            <div className="leak-category-section">
              <div className="leak-cat-header">
                <span>🛡️ Insurance Overpayment</span>
                <span className="leak-cat-total mono" style={{ color: '#9b59b6' }}>
                  {formatCurrency(analysis.insurance.reduce((s, x) => s + x.potentialSaving, 0))}/yr
                </span>
              </div>
              {analysis.insurance.map((ins, i) => (
                <div key={i} className="leak-item">
                  <div className="leak-item-left">
                    <div className="leak-item-name">{ins.name}</div>
                    <div className="leak-item-meta leak-item-issue">{ins.issue}</div>
                  </div>
                  <div className="leak-item-right">
                    <div className="leak-item-amount mono">₹{ins.premium.toLocaleString('en-IN')}/yr</div>
                    <div className="leak-item-annual mono" style={{ color: '#9b59b6' }}>
                      Save {formatCurrency(ins.potentialSaving)}/yr
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div className="leak-disclaimer">
            This analysis uses sample data for demonstration. In a production version, this would securely scan your actual bank statements (processed locally on-device). Always verify fees with your bank/AMC.
          </div>
        </div>
      )}
    </div>
  );
}
