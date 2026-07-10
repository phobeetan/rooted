import { useEffect, useRef, useState } from 'react'
import CardGrid from '../components/CardGrid.jsx'
import GrowingTree from '../components/GrowingTree.jsx'
import StatCarousel from '../components/StatCarousel.jsx'
import StartupModal from '../components/StartupModal.jsx'
import { founders, startups, stats } from '../data/rootedData.js'
import { onAuthChange } from '../../scripts/services/supabaseService.js'

function Home() {
  const logoRef = useRef(null)
  const [tab, setTab] = useState('investors')
  const [query, setQuery] = useState('')
  const [selectedStartup, setSelectedStartup] = useState(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const q = query.trim().toLowerCase()
  const startHref = loggedIn ? '/dashboard.html' : '/login.html?mode=signup'

  const startupMatches = startups.filter((item) => (
    item.name.toLowerCase().includes(q) || item.tag.toLowerCase().includes(q)
  ))
  const founderMatches = founders.filter((item) => (
    item.name.toLowerCase().includes(q) || item.tag.toLowerCase().includes(q)
  ))

  useEffect(() => {
    const animateLogo = () => {
      const progress = Math.min(window.scrollY / window.innerHeight, 1)
      const logo = logoRef.current
      if (!logo) return
      logo.style.setProperty('--logo-shift', `${progress * 160}px`)
      logo.style.setProperty('--logo-turn', `${progress * 28}deg`)
      logo.style.setProperty('--logo-scale', 1 + progress * 0.35)
      logo.style.setProperty('--logo-opacity', 0.82 - progress * 0.5)
    }

    animateLogo()
    window.addEventListener('scroll', animateLogo, { passive: true })
    return () => window.removeEventListener('scroll', animateLogo)
  }, [])

  useEffect(() => onAuthChange((user) => setLoggedIn(Boolean(user))), [])

  return (
    <>
      <main>
        <section className="hero">
          <img ref={logoRef} className="hero-logo" src="/rooted-flower.png" alt="Rooted Finance flower" />
          <div className="index">Rooted Finance</div>
          <h1>Build wealth. Build freedom.</h1>
          <p>A calm place to learn, practice investing, find women-led companies, and back founders growing from the same roots.</p>
          <div className="hero-foot">
            <a className="btn-outline" href={startHref}>{loggedIn ? 'Dashboard' : 'Start'}</a>
            <div className="scroll"><span>Scroll to grow</span><div className="line" /></div>
          </div>
        </section>

        <section className="stats-band">
          <div>
            <p className="label">Welcome</p>
            <h2>Your personalized wealth blueprint is ready.</h2>
          </div>
          <StatCarousel slides={stats} />
        </section>

        <GrowingTree />

        <section className="directory" id="directory">
          <div className="section-head">
            <div>
              <p className="label">Directory</p>
              <h2>Find who you are building with</h2>
            </div>
            <label className="search-row">
              <span>Search</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Startup, founder, or sector" />
            </label>
          </div>

          <div className="tabs">
            <button className={tab === 'investors' ? 'active' : ''} type="button" onClick={() => setTab('investors')}>For investors</button>
            <button className={tab === 'founders' ? 'active' : ''} type="button" onClick={() => setTab('founders')}>For founders</button>
          </div>

          {tab === 'investors' ? (
            <>
              <p className="subhead">Startup directory</p>
              <CardGrid items={startupMatches} onSelect={setSelectedStartup} />
              <p className="subhead">Founder directory</p>
              <CardGrid items={founderMatches} />
            </>
          ) : (
            <div className="founder-panel">
              <div>
                <strong>12.8%</strong>
                <p>Of U.S. patent inventors are women.</p>
                <small>Source: USPTO, Progress and Potential, 2019 data</small>
              </div>
              <p>Submit your idea, get a novelty check against existing patents and products, and reach investors looking for what you are building.</p>
              <a className="btn-outline" href={startHref}>{loggedIn ? 'Dashboard' : 'Start your journey'}</a>
            </div>
          )}
        </section>

        <section className="cta" id="cta">
          <div>
            <p className="label">Ready when you are</p>
            <h2>Plant something today.</h2>
            <p>Ten minutes to set up your profile. A lifetime of compounding.</p>
          </div>
          <a className="btn-outline" href={startHref}>{loggedIn ? 'Dashboard' : 'Get started'}</a>
        </section>
      </main>

      <StartupModal startup={selectedStartup} onClose={() => setSelectedStartup(null)} />
    </>
  )
}

export default Home
