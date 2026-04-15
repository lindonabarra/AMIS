function Header() {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <span className="header-logo">DHL</span>
          <div>
            <div className="header-title">AMIS Team Dashboard</div>
            <div className="header-date">{dateStr}</div>
          </div>
        </div>
        <div className="header-meta">
          <div className="header-subtitle">IT Services</div>
        </div>
      </div>
    </header>
  )
}

export default Header
