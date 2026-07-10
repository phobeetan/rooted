import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { onAuthChange } from '../../scripts/services/supabaseService.js'

const links = [
  ['/', 'Home'],
  ['/#directory', 'Directory'],
  ['/mock-fidelity', 'Mock Fidelity Account'],
  ['/startups', 'Startups'],
  ['/trade', 'Trade'],
  ['/crypto', 'Crypto'],
  ['/donations', 'Donations'],
  ['/salary-negotiation', 'Salary Negotiation'],
  ['/forum', 'Forum'],
]

function Navigation() {
  const [loggedIn, setLoggedIn] = useState(false)
  const navigate = useNavigate()

  useEffect(() => onAuthChange((user) => setLoggedIn(Boolean(user))), [])

  function openSection(event, href) {
    event.preventDefault()
    navigate(href)
    requestAnimationFrame(() => document.getElementById(href.slice(2))?.scrollIntoView())
  }

  return (
    <nav className="site-nav">
      <Link className="brand" to="/">Rooted</Link>
      <ul>
        {links.map(([href, label]) => (
          <li key={href}>
            {href.includes('#')
              ? <a href={href} onClick={(event) => openSection(event, href)}>{label}</a>
              : <Link to={href}>{label}</Link>}
          </li>
        ))}
        {loggedIn ? (
          <li>
            <a aria-label="Profile" href="/dashboard.html">
              <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" width="18">
                <circle cx="12" cy="8" r="4" />
                <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
              </svg>
            </a>
          </li>
        ) : (
          <>
            <li><a href="/login.html?mode=login">Log in</a></li>
            <li><a href="/login.html?mode=signup">Sign up</a></li>
          </>
        )}
      </ul>
    </nav>
  )
}

export default Navigation
