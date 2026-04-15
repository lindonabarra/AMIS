import { useState, useEffect } from 'react'

const defaultLinks = [
  { id: 1, label: 'Confluence',  url: 'https://confluence.atlassian.com', icon: '📖', color: '#0052CC' },
  { id: 2, label: 'Jira',        url: 'https://www.atlassian.com/software/jira', icon: '🎯', color: '#0052CC' },
  { id: 3, label: 'Teams',       url: 'https://teams.microsoft.com', icon: '💬', color: '#6264A7' },
  { id: 4, label: 'Outlook',     url: 'https://outlook.office365.com', icon: '📧', color: '#0078D4' },
  { id: 5, label: 'SharePoint',  url: 'https://sharepoint.com', icon: '📁', color: '#038387' },
  { id: 6, label: 'GitHub',      url: 'https://github.com', icon: '🐙', color: '#24292F' },
]

const blankLink = { label: '', url: '', icon: '🔗', color: '#D40511' }

const ICONS = ['🔗','📖','🎯','💬','📧','📁','🐙','📊','🔧','🌐','📋','🗂','🏠','⚙️','📱','🔒','📈','💡']

export default function QuickLinks() {
  const [links, setLinks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dhl_links')) || defaultLinks } catch { return defaultLinks }
  })
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(blankLink)

  useEffect(() => {
    localStorage.setItem('dhl_links', JSON.stringify(links))
  }, [links])

  const openAdd = () => { setForm(blankLink); setModal({ mode: 'add' }) }
  const openEdit = (link) => { setForm({ ...link }); setModal({ mode: 'edit', link }) }
  const closeModal = () => { setModal(null); setForm(blankLink) }

  const save = () => {
    if (!form.label.trim() || !form.url.trim()) return
    const url = form.url.startsWith('http') ? form.url : 'https://' + form.url
    if (modal.mode === 'add') {
      setLinks(prev => [...prev, { ...form, url, id: Date.now() }])
    } else {
      setLinks(prev => prev.map(l => l.id === modal.link.id ? { ...form, url, id: l.id } : l))
    }
    closeModal()
  }

  const deleteLink = (id) => {
    setLinks(prev => prev.filter(l => l.id !== id))
    closeModal()
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2><span className="icon">🔗</span> Quick Links</h2>
          <button className="btn btn-red" onClick={openAdd}>+ Add Link</button>
        </div>
        <div className="card-body">
          {links.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔗</div>
              <p>No links added yet.</p>
            </div>
          ) : (
            <div className="links-grid">
              {links.map(link => (
                <div key={link.id} className="link-card" title={link.url}>
                  <div className="link-actions">
                    <button className="btn-icon" title="Edit" onClick={e => { e.stopPropagation(); openEdit(link) }}>✏</button>
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', width: '100%' }}
                    onClick={e => e.stopPropagation()}
                  >
                    <span className="link-icon">{link.icon}</span>
                    <span className="link-label">{link.label}</span>
                    <span className="link-url">{link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                  </a>
                </div>
              ))}
              <button className="link-add-btn" onClick={openAdd}>
                <span style={{ fontSize: '1.4rem' }}>＋</span>
                Add Link
              </button>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal.mode === 'add' ? '+ Add Quick Link' : '✏ Edit Link'}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Label *</label>
                <input
                  className="form-input"
                  placeholder="e.g. Confluence"
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">URL *</label>
                <input
                  className="form-input"
                  placeholder="https://..."
                  value={form.url}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Icon</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {ICONS.map(ic => (
                    <button
                      key={ic}
                      onClick={() => setForm(f => ({ ...f, icon: ic }))}
                      style={{
                        width: 36, height: 36,
                        borderRadius: 6,
                        border: form.icon === ic ? '2px solid var(--dhl-red)' : '1px solid var(--dhl-mid-gray)',
                        background: form.icon === ic ? '#fff5f5' : 'white',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {ic}
                    </button>
                  ))}
                  <input
                    className="form-input"
                    placeholder="Or type emoji"
                    value={form.icon}
                    onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                    style={{ width: 100 }}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {modal.mode === 'edit' && (
                <button className="btn btn-ghost" style={{ color: 'var(--dhl-red)', borderColor: 'var(--dhl-red)' }} onClick={() => deleteLink(modal.link.id)}>
                  Delete
                </button>
              )}
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-red" onClick={save} disabled={!form.label.trim() || !form.url.trim()}>
                {modal.mode === 'add' ? 'Add Link' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
