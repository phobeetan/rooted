import { useEffect, useState } from 'react'
import { onAuthChange } from '../../scripts/services/supabaseService.js'

const links = [
  ['/', 'Home'],
  ['/#growth', 'Journey'],
  ['/#directory', 'Directory'],
  ['/paper-trading', 'Paper Trade'],
  ['/mock-fidelity', 'Mock Fidelity'],
  ['/investment-chatbot', 'AI Assistant'],
  ['/salary-negotiation', 'Salary Negotiation'],
  ['/startups', 'Startups'],
  ['/forum', 'Forum'],
]

function Navigation() {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => onAuthChange((user) => setLoggedIn(Boolean(user))), [])

  return (
    <nav className="site-nav">
      <a className="brand" href="/">Rooted</a>
      <ul>
        {links.map(([href, label]) => (
          <li key={href}>
            <a href={href}>{label}</a>
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
