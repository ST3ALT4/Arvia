import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { fetchChart, RANGE_MAP } from '../services/stockApi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const RANGES = ['1D', '1W', '1M', '6M', '1Y', '5Y'];

export default function PriceChart({ symbol }) {
  const [activeRange, setActiveRange] = useState('1M');
  const [chartData, setChartData] = useState({ labels: [], prices: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const { range, interval } = RANGE_MAP[activeRange];
    fetchChart(symbol, range, interval)
      .then((data) => {
        if (!cancelled) {
          setChartData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Chart fetch failed:', err);
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [symbol, activeRange]);

  // Determine chart color based on price movement
  const prices = chartData.prices.filter((p) => p != null);
  const isGain = prices.length >= 2 && prices[prices.length - 1] >= prices[0];
  const lineColor = isGain ? '#3FB68B' : '#E1574F';

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        data: chartData.prices,
        borderColor: lineColor,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: lineColor,
        pointHoverBorderColor: '#E8EAED',
        pointHoverBorderWidth: 2,
        tension: 0.35,
        fill: true,
        backgroundColor: (ctx) => {
          const canvas = ctx.chart.ctx;
          const gradient = canvas.createLinearGradient(0, 0, 0, 260);
          const rgb = isGain ? '63, 182, 139' : '225, 87, 79';
          gradient.addColorStop(0, `rgba(${rgb}, 0.18)`);
          gradient.addColorStop(1, `rgba(${rgb}, 0)`);
          return gradient;
        },
        spanGaps: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    scales: {
      x: {
        grid: { color: 'rgba(28, 35, 51, 0.5)', drawBorder: false },
        ticks: {
          color: '#7A8699',
          font: { family: "'IBM Plex Mono'", size: 11 },
          maxTicksLimit: 8,
        },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(28, 35, 51, 0.5)', drawBorder: false },
        ticks: {
          color: '#7A8699',
          font: { family: "'IBM Plex Mono'", size: 11 },
          callback: (val) => '₹' + val.toLocaleString('en-IN'),
        },
        border: { display: false },
      },
    },
    plugins: {
      tooltip: {
        backgroundColor: '#111620',
        borderColor: '#1C2333',
        borderWidth: 1,
        titleColor: '#7A8699',
        bodyColor: '#E8EAED',
        bodyFont: { family: "'IBM Plex Mono'", size: 13 },
        titleFont: { family: "'Inter'", size: 11 },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (ctx) => `₹${ctx.parsed.y?.toLocaleString('en-IN')}`,
        },
      },
    },
  };

  return (
    <>
      <div className="range-tabs">
        {RANGES.map((r) => (
          <button
            key={r}
            className={`range-tab${activeRange === r ? ' active' : ''}`}
            onClick={() => setActiveRange(r)}
            id={`range-${r}`}
          >
            {r}
          </button>
        ))}
      </div>
      <div className="chart-card">
        <div className="chart-wrap">
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)', fontSize: 13 }}>
              Loading chart data…
            </div>
          ) : error ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--loss)', fontSize: 13 }}>
              Failed to load chart: {error}
            </div>
          ) : (
            <Line data={data} options={options} />
          )}
        </div>
      </div>
    </>
  );
}
