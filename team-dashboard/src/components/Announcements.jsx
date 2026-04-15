import { useState, useEffect } from 'react'

const defaultAnnouncements = [
  {
    id: 1,
    title: 'Welcome to the Team Dashboard!',
    body: 'This dashboard is your central hub for team updates, calendar events, and quick access links. All content is editable — just click the buttons to get started.',
    priority: 'high',
    date: new Date().toISOString().slice(0, 10),
    author: 'Admin',
  },
  {
    id: 2,
    title: 'Q2 Planning Kickoff',
    body: 'Q2 planning sessions will begin next week. Please review the project roadmap and prepare your team updates before the kickoff meeting.',
    priority: 'medium',
    date: new Date().toISOString().slice(0, 10),
    author: 'IT Manager',
  },
  {
    id: 3,
    title: 'System Maintenance Window',
    body: 'Scheduled maintenance on Saturday 02:00–06:00 UTC. Expect brief service interruptions during this period.',
    priority: 'low',
    date: new Date().toISOString().slice(0, 10),
    author: 'Ops Team',
  },
]

const blank = { title: '', body: '', priority: 'medium', author: '', date: new Date().toISOString().slice(0, 10) }

export default function Announcements() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dhl_announcements')) || defaultAnnouncements } catch { return defaultAnnouncements }
  })
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(blank)

  useEffect(() => {
    localStorage.setItem('dhl_announcements', JSON.stringify(items))
  }, [items])

  const openAdd = () => { setForm({ ...blank, date: new Date().toISOString().slice(0, 10) }); setModal({ mode: 'add' }) }
  const openEdit = (item) => { setForm({ ...item }); setModal({ mode: 'edit', item }) }
  const closeModal = () => { setModal(null); setForm(blank) }

  const save = () => {
    if (!form.title.trim() || !form.body.trim()) return
    if (modal.mode === 'add') {
      setItems(prev => [{ ...form, id: Date.now() }, ...prev])
    } else {
      setItems(prev => prev.map(a => a.id === modal.item.id ? { ...form, id: a.id } : a))
    }
    closeModal()
  }

  const deleteItem = (id) => {
    setItems(prev => prev.filter(a => a.id !== id))
    closeModal()
  }

  const formatDate = (ds) => {
    if (!ds) return ''
    const d = new Date(ds + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Sort: high -> medium -> low, then by date desc
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  const sorted = [...items].sort((a, b) => {
    const pd = priorityOrder[a.priority] - priorityOrder[b.priority]
    return pd !== 0 ? pd : (b.date || '').localeCompare(a.date || '')
  })

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2><span className="icon">📢</span> Announcements</h2>
          <button className="btn btn-red" onClick={openAdd}>+ Post</button>
        </div>
        <div className="card-body">
          {sorted.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📢</div>
              <p>No announcements yet.</p>
            </div>
          ) : (
            <div className="announcement-list">
              {sorted.map(item => (
                <div key={item.id} className={`announcement priority-${item.priority}`}>
                  <div className="announcement-header">
                    <div className="announcement-title">{item.title}</div>
                    <span className={`priority-badge ${item.priority}`}>
                      {item.priority}
                    </span>
                  </div>
                  <div className="announcement-body">{item.body}</div>
                  <div className="announcement-footer">
                    {item.author && <span style={{ fontSize: '0.72rem', color: '#888', fontWeight: 600 }}>{item.author}</span>}
                    <span className="announcement-date">{formatDate(item.date)}</span>
                    <div className="announcement-actions">
                      <button className="btn-icon" title="Edit" onClick={() => openEdit(item)}>✏</button>
                      <button className="btn-icon danger" title="Delete" onClick={() => deleteItem(item.id)}>🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal.mode === 'add' ? '📢 New Announcement' : '✏ Edit Announcement'}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  className="form-input"
                  placeholder="Announcement title"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder="Write your announcement..."
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-input form-select"
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  >
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Author</label>
                  <input
                    className="form-input"
                    placeholder="Your name"
                    value={form.author}
                    onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>
            </div>
            <div className="modal-footer">
              {modal.mode === 'edit' && (
                <button className="btn btn-ghost" style={{ color: 'var(--dhl-red)', borderColor: 'var(--dhl-red)' }} onClick={() => deleteItem(modal.item.id)}>
                  Delete
                </button>
              )}
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-red" onClick={save} disabled={!form.title.trim() || !form.body.trim()}>
                {modal.mode === 'add' ? 'Post Announcement' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
