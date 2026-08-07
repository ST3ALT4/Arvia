export default function Topbar({ activeView, onViewChange }) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">A</div>
        <span className="brand-name display">ARVIA</span>
        <span className="brand-tag">Performance tracking only · not investment advice</span>
      </div>
      <div className="topbar-right">
        <div className="market-pill"><span className="pulse"></span>NSE Live</div>
        <div className="avatar"></div>
      </div>
    </header>
  );
}
