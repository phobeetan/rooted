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
