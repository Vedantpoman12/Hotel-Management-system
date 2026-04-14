import './Header.css';

export default function Header() {
  return (
    <header className="lm-header">
      <div className="lm-header-left">
        <div className="lm-avatar">
          <img src="https://i.pravatar.cc/100?img=47" alt="Concierge" />
        </div>
        <div>
          <h1 className="lm-header-title">Concierge Portal</h1>
          <p className="lm-header-sub">Lumiere Grand</p>
        </div>
      </div>
      <div className="lm-header-right">
        <button className="lm-icon-btn" title="Search">
          <span className="material-symbols-outlined">search</span>
        </button>
      </div>
    </header>
  );
}
