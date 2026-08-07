import { newsAnchor, tickerItems, newsBriefs } from '../data/mockData';

export default function NewsAnchorRail() {
  // Duplicate ticker items for infinite scroll illusion
  const doubledTicker = [...tickerItems, ...tickerItems];

  return (
    <aside className="news">
      <div className="anchor-card" id="news-anchor">
        <div className="anchor-header">
          <div className="anchor-title">
            <span className="display">News Anchor</span>
          </div>
          <div className="on-air"><span className="on-air-dot"></span>ON AIR</div>
        </div>
        <div className="anchor-figure">
          <div className="anchor-silhouette"></div>
        </div>
        <div className="anchor-body">
          <div className="anchor-timestamp mono">{newsAnchor.timestamp}</div>
          <div className="anchor-script">
            <p><span className="lead">{newsAnchor.script.lead}</span> {newsAnchor.script.body}</p>
            <p>{newsAnchor.script.close}</p>
          </div>
        </div>
        <div className="anchor-tickerbar">
          <div className="ticker-track">
            {doubledTicker.map((t, i) => (
              <span key={i}>
                <span style={{ color: 'var(--text-dim)' }}>{t.symbol}</span>{' '}
                <span className={t.direction}>{t.value} {t.change}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="news-label">Earlier Briefs</div>
      {newsBriefs.map((brief, i) => (
        <div className="brief-item" key={i}>
          <div className="brief-symbol">{brief.symbol}</div>
          <div className="brief-text">{brief.text}</div>
        </div>
      ))}
    </aside>
  );
}
