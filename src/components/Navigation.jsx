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

  const authLinks = loggedIn
    ? [['/dashboard.html', 'Profile']]
    : [['/login.html?mode=login', 'Log in'], ['/login.html?mode=signup', 'Sign up']]

  return (
    <nav className="site-nav">
      <a className="brand" href="/">Rooted</a>
      <ul>
        {[...links, ...authLinks].map(([href, label]) => (
          <li key={href}>
            <a href={href}>{label}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Navigation
