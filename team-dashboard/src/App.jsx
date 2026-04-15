import { useState } from 'react'
import Header from './components/Header'
import Calendar from './components/Calendar'
import QuickLinks from './components/QuickLinks'
import Announcements from './components/Announcements'
import './index.css'

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <div className="area-calendar">
          <Calendar />
        </div>
        <div className="area-sidebar">
          <Announcements />
        </div>
        <div className="area-links">
          <QuickLinks />
        </div>
      </main>
      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()} <strong>DHL</strong> IT Services &mdash; Team Dashboard &mdash; All rights reserved.
        </p>
      </footer>
    </div>
  )
}

export default App
