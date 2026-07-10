const links = [
  ['/', 'Home'],
  ['/#growth', 'Journey'],
  ['/#directory', 'Directory'],
  ['/startups', 'Startups'],
  ['/paper-trading', 'Paper Trade'],
  ['/investment-chatbot', 'AI Assistant'],
  ['/forum', 'Forum'],
  ['/mock-fidelity', 'Mock Fidelity'],
  ['/login.html', 'Login'],
]

function Navigation() {
  return (
    <nav className="site-nav">
      <a className="brand" href="/">Rooted</a>
      <ul>
        {links.map(([href, label]) => (
          <li key={href}>
            <a href={href}>{label}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Navigation
