import { holdings } from '../data/mockData';

export default function HoldingsTable() {
  return (
    <div className="holdings-card" id="holdings-table">
      <div className="holdings-title display">Your Holdings</div>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th className="th-right">Qty</th>
            <th className="th-right">Avg. Cost</th>
            <th className="th-right">LTP</th>
            <th className="th-right">P&L</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => (
            <tr key={h.symbol}>
              <td className="mono">{h.symbol}</td>
              <td className="td-right mono">{h.qty}</td>
              <td className="td-right mono">{h.avgCost}</td>
              <td className="td-right mono">{h.ltp}</td>
              <td className={`td-right mono ${h.direction}`}>{h.pnl}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
