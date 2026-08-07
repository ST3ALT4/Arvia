import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

/**
 * Real-Inflation Goal Simulator
 * Shows users the real purchasing power of their savings over time,
 * comparing nominal growth vs inflation-adjusted value.
 */

const PRESETS = [
  { label: '🏠 Buy a House', goalCost: 5000000, years: 10, monthlySaving: 25000, icon: '🏠' },
  { label: '🎓 Child Education', goalCost: 2500000, years: 15, monthlySaving: 8000, icon: '🎓' },
  { label: '🚗 Buy a Car', goalCost: 1200000, years: 3, monthlySaving: 30000, icon: '🚗' },
  { label: '🏖️ Dream Vacation', goalCost: 300000, years: 2, monthlySaving: 12000, icon: '🏖️' },
  { label: '🧓 Retirement Corpus', goalCost: 30000000, years: 25, monthlySaving: 20000, icon: '🧓' },
];

const INFLATION_RATES = [
  { label: '5%', value: 5 },
  { label: '6%', value: 6 },
  { label: '7%', value: 7 },
  { label: '8%', value: 8 },
];

const INVESTMENT_OPTIONS = [
  { label: 'Savings Account', returnRate: 3.5, risk: 'No Risk', color: '#7A8699' },
  { label: 'Fixed Deposit', returnRate: 7.0, risk: 'No Risk', color: '#3498db' },
  { label: 'Debt Fund', returnRate: 7.5, risk: 'Low', color: '#2ecc71' },
  { label: 'Index Fund (Nifty 50)', returnRate: 12.0, risk: 'Moderate', color: 'var(--accent)' },
  { label: 'Equity MF (Flexi Cap)', returnRate: 14.0, risk: 'High', color: 'var(--gain)' },
];

function formatINR(n) {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1) + ' Cr';
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + ' L';
  if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

/** Calculate future value with monthly SIP */
function computeProjection(monthlySaving, years, annualReturn) {
  const monthlyRate = annualReturn / 100 / 12;
  const months = years * 12;
  const points = [];

  let total = 0;
  for (let m = 0; m <= months; m++) {
    if (m > 0) {
      total = total * (1 + monthlyRate) + monthlySaving;
    }
    // Record annually
    if (m % 12 === 0) {
      points.push(Math.round(total));
    }
  }
  return points;
}

/** Calculate inflation-adjusted goal cost */
function inflatedCost(currentCost, years, inflationRate) {
  return currentCost * Math.pow(1 + inflationRate / 100, years);
}

/** Calculate inflation-adjusted (real) value of savings */
function realValue(nominalValue, years, inflationRate) {
  return nominalValue / Math.pow(1 + inflationRate / 100, years);
}

export default function GoalSimulator() {
  const [goalCost, setGoalCost] = useState(5000000);
  const [years, setYears] = useState(10);
  const [monthlySaving, setMonthlySaving] = useState(25000);
  const [inflationRate, setInflationRate] = useState(6);
  const [selectedInvestment, setSelectedInvestment] = useState(3); // Index Fund default
  const chartRef = useRef(null);

  const investment = INVESTMENT_OPTIONS[selectedInvestment];

  // Compute all projections
  const projection = useMemo(() => {
    const labels = Array.from({ length: years + 1 }, (_, i) => `Year ${i}`);
    const totalInvested = computeProjection(monthlySaving, years, 0); // no return
    const nominalGrowth = computeProjection(monthlySaving, years, investment.returnRate);
    const realGrowth = nominalGrowth.map((val, i) => Math.round(realValue(val, i, inflationRate)));

    // Inflated goal line
    const goalLine = labels.map((_, i) => Math.round(inflatedCost(goalCost, i, inflationRate)));

    const finalNominal = nominalGrowth[nominalGrowth.length - 1];
    const finalReal = realGrowth[realGrowth.length - 1];
    const finalGoal = goalLine[goalLine.length - 1];
    const totalContributed = monthlySaving * years * 12;
    const wealthCreated = finalNominal - totalContributed;
    const purchasingPowerLoss = finalNominal - finalReal;
    const goalGap = finalGoal - finalNominal;
    const goalReached = finalNominal >= finalGoal;

    return {
      labels,
      totalInvested,
      nominalGrowth,
      realGrowth,
      goalLine,
      finalNominal,
      finalReal,
      finalGoal,
      totalContributed,
      wealthCreated,
      purchasingPowerLoss,
      goalGap,
      goalReached,
    };
  }, [goalCost, years, monthlySaving, inflationRate, investment.returnRate]);

  const handlePreset = (preset) => {
    setGoalCost(preset.goalCost);
    setYears(preset.years);
    setMonthlySaving(preset.monthlySaving);
  };

  // Chart data
  const chartData = {
    labels: projection.labels,
    datasets: [
      {
        label: 'Goal Cost (Inflated)',
        data: projection.goalLine,
        borderColor: 'var(--loss)',
        borderWidth: 2,
        borderDash: [6, 4],
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.3,
        fill: false,
      },
      {
        label: 'Nominal Growth',
        data: projection.nominalGrowth,
        borderColor: 'var(--gain)',
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'var(--gain)',
        tension: 0.3,
        fill: true,
        backgroundColor: (ctx) => {
          const canvas = ctx.chart.ctx;
          const gradient = canvas.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(63, 182, 139, 0.2)');
          gradient.addColorStop(1, 'rgba(63, 182, 139, 0)');
          return gradient;
        },
      },
      {
        label: 'Real Value (After Inflation)',
        data: projection.realGrowth,
        borderColor: 'var(--accent)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.3,
        fill: false,
      },
      {
        label: 'Total Invested',
        data: projection.totalInvested,
        borderColor: 'var(--text-dim)',
        borderWidth: 1,
        borderDash: [3, 3],
        pointRadius: 0,
        tension: 0,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    scales: {
      x: {
        grid: { color: 'rgba(28, 35, 51, 0.5)', drawBorder: false },
        ticks: { color: '#7A8699', font: { family: "'IBM Plex Mono'", size: 10 }, maxTicksLimit: 10 },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(28, 35, 51, 0.5)', drawBorder: false },
        ticks: {
          color: '#7A8699',
          font: { family: "'IBM Plex Mono'", size: 10 },
          callback: (val) => formatINR(val),
        },
        border: { display: false },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#7A8699',
          font: { family: "'Inter'", size: 11 },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: '#111620',
        borderColor: '#1C2333',
        borderWidth: 1,
        titleColor: '#7A8699',
        bodyColor: '#E8EAED',
        bodyFont: { family: "'IBM Plex Mono'", size: 12 },
        titleFont: { family: "'Inter'", size: 11 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${formatINR(ctx.parsed.y)}`,
        },
      },
    },
  };

  return (
    <div className="goal-section" id="goal-simulator">
      <div className="section-header">
        <div className="section-title">
          <span className="display">Goal Simulator</span>
          <span className="section-badge" style={{ background: 'var(--gain)', color: '#000' }}>INFLATION-PROOF</span>
        </div>
      </div>

      <p className="goal-subtitle">
        Don't just save money — see how much it will <em>actually</em> be worth after inflation eats into it. Set a life goal and watch the real numbers.
      </p>

      {/* Presets */}
      <div className="goal-presets">
        {PRESETS.map((p, i) => (
          <button key={i} className="goal-preset-btn" onClick={() => handlePreset(p)}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Controls Grid */}
      <div className="goal-controls">
        {/* Goal Cost */}
        <div className="goal-control-card">
          <div className="goal-control-label">🎯 Goal Cost (Today)</div>
          <div className="goal-control-value mono">{formatINR(goalCost)}</div>
          <input
            type="range"
            className="goal-slider"
            min={100000}
            max={50000000}
            step={100000}
            value={goalCost}
            onChange={(e) => setGoalCost(Number(e.target.value))}
            id="goal-cost-slider"
          />
          <div className="goal-slider-range">
            <span>₹1L</span><span>₹5 Cr</span>
          </div>
        </div>

        {/* Time Horizon */}
        <div className="goal-control-card">
          <div className="goal-control-label">📅 Time Horizon</div>
          <div className="goal-control-value mono">{years} years</div>
          <input
            type="range"
            className="goal-slider"
            min={1}
            max={30}
            step={1}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            id="goal-years-slider"
          />
          <div className="goal-slider-range">
            <span>1 yr</span><span>30 yrs</span>
          </div>
        </div>

        {/* Monthly SIP */}
        <div className="goal-control-card">
          <div className="goal-control-label">💰 Monthly SIP</div>
          <div className="goal-control-value mono">{formatINR(monthlySaving)}/mo</div>
          <input
            type="range"
            className="goal-slider"
            min={1000}
            max={200000}
            step={1000}
            value={monthlySaving}
            onChange={(e) => setMonthlySaving(Number(e.target.value))}
            id="goal-sip-slider"
          />
          <div className="goal-slider-range">
            <span>₹1K</span><span>₹2L</span>
          </div>
        </div>

        {/* Inflation Rate */}
        <div className="goal-control-card">
          <div className="goal-control-label">🔥 Inflation Rate</div>
          <div className="goal-control-value mono">{inflationRate}%/yr</div>
          <div className="goal-rate-pills">
            {INFLATION_RATES.map((r) => (
              <button
                key={r.value}
                className={`goal-rate-pill${inflationRate === r.value ? ' active' : ''}`}
                onClick={() => setInflationRate(r.value)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Investment Option Selector */}
      <div className="goal-invest-section">
        <div className="goal-invest-label">Where are you investing?</div>
        <div className="goal-invest-options">
          {INVESTMENT_OPTIONS.map((opt, i) => (
            <button
              key={i}
              className={`goal-invest-card${selectedInvestment === i ? ' active' : ''}`}
              onClick={() => setSelectedInvestment(i)}
              style={selectedInvestment === i ? { borderColor: opt.color } : {}}
            >
              <div className="goal-invest-name">{opt.label}</div>
              <div className="goal-invest-return mono" style={{ color: opt.color }}>{opt.returnRate}%</div>
              <div className="goal-invest-risk">{opt.risk}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="goal-chart-card">
        <div className="goal-chart-wrap">
          <Line ref={chartRef} data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Outcome Cards */}
      <div className="goal-outcome-grid">
        <div className="goal-outcome-card">
          <div className="goal-outcome-label">Total You'll Invest</div>
          <div className="goal-outcome-value mono">{formatINR(projection.totalContributed)}</div>
          <div className="goal-outcome-sub">{formatINR(monthlySaving)} × {years * 12} months</div>
        </div>
        <div className="goal-outcome-card">
          <div className="goal-outcome-label">Nominal Corpus</div>
          <div className="goal-outcome-value mono" style={{ color: 'var(--gain)' }}>{formatINR(projection.finalNominal)}</div>
          <div className="goal-outcome-sub">
            Wealth created: <span style={{ color: 'var(--gain)' }}>{formatINR(projection.wealthCreated)}</span>
          </div>
        </div>
        <div className="goal-outcome-card">
          <div className="goal-outcome-label">Real Purchasing Power</div>
          <div className="goal-outcome-value mono" style={{ color: 'var(--accent)' }}>{formatINR(projection.finalReal)}</div>
          <div className="goal-outcome-sub">
            Inflation eats: <span style={{ color: 'var(--loss)' }}>-{formatINR(projection.purchasingPowerLoss)}</span>
          </div>
        </div>
        <div className="goal-outcome-card">
          <div className="goal-outcome-label">Goal Cost in {years} Years</div>
          <div className="goal-outcome-value mono" style={{ color: 'var(--loss)' }}>{formatINR(projection.finalGoal)}</div>
          <div className={`goal-outcome-verdict ${projection.goalReached ? 'success' : 'fail'}`}>
            {projection.goalReached
              ? `✅ You'll reach your goal with ${formatINR(projection.finalNominal - projection.finalGoal)} surplus!`
              : `❌ Short by ${formatINR(Math.abs(projection.goalGap))} — increase SIP or extend timeline.`
            }
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="goal-disclaimer">
        Projections are mathematical estimates based on assumed constant returns and inflation. Actual returns vary. Past performance does not guarantee future results. Consult a SEBI-registered financial advisor.
      </div>
    </div>
  );
}
