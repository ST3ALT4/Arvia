/**
 * Mock data for the ARVIA dashboard.
 * Separates content from UI components.
 */

export const watchlist = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: '2,945.60', change: '+1.24%', direction: 'up' },
  { symbol: 'TCS', name: 'Tata Consultancy Svcs', price: '3,812.15', change: '-0.42%', direction: 'down' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', price: '1,687.30', change: '+0.68%', direction: 'up' },
  { symbol: 'INFY', name: 'Infosys', price: '1,542.90', change: '-1.15%', direction: 'down' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', price: '968.45', change: '+2.31%', direction: 'up' },
  { symbol: 'ITC', name: 'ITC Ltd', price: '432.10', change: '+0.19%', direction: 'up' },
];

export const portfolio = {
  invested: '₹4,82,300',
  currentValue: '₹5,16,940',
};

export const holdings = [
  { symbol: 'RELIANCE', qty: 40, avgCost: '2,810.00', ltp: '2,945.60', pnl: '+₹5,424 (4.8%)', direction: 'up' },
  { symbol: 'TCS', qty: 15, avgCost: '3,920.00', ltp: '3,812.15', pnl: '-₹1,618 (-2.8%)', direction: 'down' },
  { symbol: 'HDFCBANK', qty: 60, avgCost: '1,590.00', ltp: '1,687.30', pnl: '+₹5,838 (6.1%)', direction: 'up' },
  { symbol: 'TATAMOTORS', qty: 80, avgCost: '890.00', ltp: '968.45', pnl: '+₹6,276 (8.8%)', direction: 'up' },
];

export const stockDetails = {
  RELIANCE: {
    fullName: 'Reliance Industries Ltd',
    exchange: 'NSE',
    sector: 'Oil, Gas & Consumable Fuels',
    price: '₹2,945.60',
    delta: '▲ 36.10 (1.24%)',
    direction: 'up',
    stats: {
      range52w: '₹2,220 – ₹3,140',
      volume: '8.4M',
      marketCap: '₹19.9L Cr',
      pe: '24.6',
    },
    chartData: [2880, 2910, 2895, 2920, 2935, 2915, 2945],
    chartLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
};

export const newsAnchor = {
  timestamp: 'TODAY · 4:05 PM IST · MARKET CLOSE BRIEF',
  script: {
    lead: 'Good evening.',
    body: `Reliance Industries closed higher today, up 1.24% at ₹2,945.60 on the NSE. The session saw steady buying interest, with 8.4 million shares changing hands — roughly in line with its 20-day average volume. The stock touched an intraday high of ₹2,958 before settling near the upper end of its range.`,
    close: `Across the broader market, the Nifty 50 gained 0.6%, led by energy and auto names. TATA MOTORS extended its rally for a third consecutive session.`,
  },
};

export const tickerItems = [
  { symbol: 'NIFTY 50', value: '24,680', change: '+0.6%', direction: 'up' },
  { symbol: 'SENSEX', value: '81,420', change: '+0.5%', direction: 'up' },
  { symbol: 'BANKNIFTY', value: '52,310', change: '+0.3%', direction: 'up' },
  { symbol: 'RELIANCE', value: '2,945', change: '+1.2%', direction: 'up' },
  { symbol: 'TCS', value: '3,812', change: '-0.4%', direction: 'down' },
  { symbol: 'INFY', value: '1,542', change: '-1.1%', direction: 'down' },
  { symbol: 'HDFCBANK', value: '1,687', change: '+0.7%', direction: 'up' },
  { symbol: 'TATAMOTORS', value: '968', change: '+2.3%', direction: 'up' },
];

export const newsBriefs = [
  { symbol: 'TATAMOTORS', text: 'Tata Motors rose 2.3% to ₹968.45, its third straight session of gains. Trading volume was elevated at 12.1M shares. The auto sector index was a top-performing segment today.' },
  { symbol: 'INFY', text: 'Infosys slipped 1.15% to ₹1,542.90 amid broad weakness in IT stocks. The Nifty IT index ended the session down 0.8%.' },
  { symbol: 'ITC', text: 'ITC traded flat, edging up 0.19% to ₹432.10. The stock has remained range-bound between ₹425 and ₹440 for the past two weeks.' },
];

/**
 * Model prediction data.
 * Mirrors the 4-head output of the 9 models from models.md.
 * In production, this would come from CSV/JSON evaluation pipeline outputs.
 */
export const MODEL_NAMES = [
  'LSTM',
  'GRU',
  'LSTM_GRU',
  'BiLSTM_Attention',
  'CNN_BiLSTM_Attention',
  'Transformer_TCN',
  'TFT',
  'XGBoost',
  'LightGBM',
];

export const modelPredictions = {
  RELIANCE: {
    LSTM:                  { trend: 'up', confidence: 72, priceReturn: 1.8,  volatility: 2.1, pricePred: 2998.60 },
    GRU:                   { trend: 'up', confidence: 68, priceReturn: 1.5,  volatility: 2.3, pricePred: 2989.80 },
    LSTM_GRU:              { trend: 'up', confidence: 74, priceReturn: 2.0,  volatility: 1.9, pricePred: 3004.30 },
    BiLSTM_Attention:      { trend: 'up', confidence: 79, priceReturn: 2.3,  volatility: 1.7, pricePred: 3013.20 },
    CNN_BiLSTM_Attention:  { trend: 'up', confidence: 81, priceReturn: 2.5,  volatility: 1.6, pricePred: 3019.50 },
    Transformer_TCN:       { trend: 'up', confidence: 84, priceReturn: 2.7,  volatility: 1.5, pricePred: 3025.00 },
    TFT:                   { trend: 'up', confidence: 83, priceReturn: 2.6,  volatility: 1.4, pricePred: 3022.10 },
    XGBoost:               { trend: 'down', confidence: 55, priceReturn: -0.3, volatility: 2.8, pricePred: 2936.70 },
    LightGBM:              { trend: 'up', confidence: 62, priceReturn: 0.9,  volatility: 2.5, pricePred: 2972.10 },
  },
};
