import { useState, useEffect } from 'react'

const EVENT_TYPES = ['meeting', 'deadline', 'event', 'training', 'other']

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

const defaultEvents = [
  { id: 1, title: 'Team Standup', date: formatDate(new Date()), type: 'meeting', time: '09:00', notes: 'Daily sync' },
  { id: 2, title: 'Sprint Review', date: formatDate(addDays(new Date(), 5)), type: 'meeting', time: '14:00', notes: '' },
  { id: 3, title: 'Q2 Deadline', date: formatDate(addDays(new Date(), 12)), type: 'deadline', time: '', notes: 'Submit all reports' },
  { id: 4, title: 'Team Outing', date: formatDate(addDays(new Date(), 20)), type: 'event', time: '12:00', notes: '' },
]

function formatDate(d) {
  return d.toISOString().slice(0, 10)
}

function addDays(d, n) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

const blankEvent = { title: '', date: '', type: 'meeting', time: '', notes: '' }

export default function Calendar() {
  const today = new Date()
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [events, setEvents] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dhl_events')) || defaultEvents } catch { return defaultEvents }
  })
  const [modal, setModal] = useState(null) // null | { mode: 'add'|'edit'|'view', event, prefillDate }
  const [form, setForm] = useState(blankEvent)

  useEffect(() => {
    localStorage.setItem('dhl_events', JSON.stringify(events))
  }, [events])

  const prevMonth = () => setView(v => {
    if (v.month === 0) return { year: v.year - 1, month: 11 }
    return { year: v.year, month: v.month - 1 }
  })
  const nextMonth = () => setView(v => {
    if (v.month === 11) return { year: v.year + 1, month: 0 }
    return { year: v.year, month: v.month + 1 }
  })
  const goToday = () => setView({ year: today.getFullYear(), month: today.getMonth() })

  const openAdd = (dateStr) => {
    setForm({ ...blankEvent, date: dateStr || formatDate(today) })
    setModal({ mode: 'add' })
  }
  const openEdit = (ev) => {
    setForm({ ...ev })
    setModal({ mode: 'edit', event: ev })
  }
  const closeModal = () => { setModal(null); setForm(blankEvent) }

  const saveEvent = () => {
    if (!form.title.trim() || !form.date) return
    if (modal.mode === 'add') {
      setEvents(prev => [...prev, { ...form, id: Date.now() }])
    } else {
      setEvents(prev => prev.map(e => e.id === modal.event.id ? { ...form, id: e.id } : e))
    }
    closeModal()
  }

  const deleteEvent = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id))
    closeModal()
  }

  // Build calendar grid
  const daysInMonth = getDaysInMonth(view.year, view.month)
  const firstDay = getFirstDayOfMonth(view.year, view.month)
  const prevMonthDays = getDaysInMonth(view.year, view.month === 0 ? 11 : view.month - 1)

  const cells = []
  // Previous month overflow
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i
    const m = view.month === 0 ? 11 : view.month - 1
    const y = view.month === 0 ? view.year - 1 : view.year
    cells.push({ day: d, month: m, year: y, current: false })
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month: view.month, year: view.year, current: true })
  }
  // Next month overflow
  let next = 1
  while (cells.length % 7 !== 0 || cells.length < 35) {
    const m = view.month === 11 ? 0 : view.month + 1
    const y = view.month === 11 ? view.year + 1 : view.year
    cells.push({ day: next++, month: m, year: y, current: false })
  }

  const getEventsForCell = (cell) => {
    const ds = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`
    return events.filter(e => e.date === ds).sort((a, b) => (a.time || '').localeCompare(b.time || ''))
  }

  const isToday = (cell) =>
    cell.current &&
    cell.day === today.getDate() &&
    cell.month === today.getMonth() &&
    cell.year === today.getFullYear()

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2><span className="icon">📅</span> Team Calendar</h2>
          <button className="btn btn-red" onClick={() => openAdd('')}>+ Add Event</button>
        </div>
        <div className="card-body">
          <div className="calendar-nav">
            <div className="calendar-nav-month">
              {MONTHS[view.month]} {view.year}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={goToday}>Today</button>
              <div className="calendar-nav-btns">
                <button className="cal-nav-btn" onClick={prevMonth} title="Previous month">&#8249;</button>
                <button className="cal-nav-btn" onClick={nextMonth} title="Next month">&#8250;</button>
              </div>
            </div>
          </div>

          <div className="calendar-grid">
            {DAYS.map(d => <div key={d} className="cal-day-header">{d}</div>)}
            {cells.map((cell, idx) => {
              const cellEvents = getEventsForCell(cell)
              const maxShow = 2
              return (
                <div
                  key={idx}
                  className={`cal-day${!cell.current ? ' other-month' : ''}${isToday(cell) ? ' today' : ''}`}
                  onClick={() => cell.current && openAdd(`${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`)}
                >
                  <div className="cal-date">{cell.day}</div>
                  {cellEvents.slice(0, maxShow).map(ev => (
                    <div
                      key={ev.id}
                      className={`cal-event type-${ev.type}`}
                      title={`${ev.time ? ev.time + ' — ' : ''}${ev.title}`}
                      onClick={e => { e.stopPropagation(); openEdit(ev) }}
                    >
                      {ev.time && <span style={{ opacity: 0.7 }}>{ev.time} </span>}{ev.title}
                    </div>
                  ))}
                  {cellEvents.length > maxShow && (
                    <div className="cal-more" onClick={e => { e.stopPropagation(); openEdit(cellEvents[maxShow]) }}>
                      +{cellEvents.length - maxShow} more
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--dhl-mid-gray)' }}>
            {EVENT_TYPES.map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: 'var(--dhl-gray)', textTransform: 'capitalize' }}>
                <span className={`cal-event type-${t}`} style={{ padding: '1px 8px', marginBottom: 0 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal.mode === 'add' ? '+ Add Event' : '✏ Edit Event'}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Event Title *</label>
                <input
                  className="form-input"
                  placeholder="e.g. Team Meeting"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  autoFocus
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-input form-select"
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                >
                  {EVENT_TYPES.map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Notes</label>
                <textarea
                  className="form-input"
                  rows="2"
                  placeholder="Optional notes..."
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
            <div className="modal-footer">
              {modal.mode === 'edit' && (
                <button className="btn btn-ghost" style={{ color: 'var(--dhl-red)', borderColor: 'var(--dhl-red)' }} onClick={() => deleteEvent(modal.event.id)}>
                  Delete
                </button>
              )}
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-red" onClick={saveEvent} disabled={!form.title.trim() || !form.date}>
                {modal.mode === 'add' ? 'Add Event' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
