import { useEffect, useRef, useState } from 'react'
import './App.css'

const stages = [
  {
    name: 'Root',
    title: 'Learn where you stand',
    copy: 'Income, rent, and what you are curious about. No jargon, just a starting point built around your actual numbers.',
  },
  {
    name: 'Sprout',
    title: 'Build your first habit',
    copy: 'A savings cushion, a budget that fits your real life, and your first automated deposit.',
  },
  {
    name: 'Sapling',
    title: 'Grow with intention',
    copy: 'Stocks, REITs, and funds aligned with what you care about, including women-led companies.',
  },
  {
    name: 'Branch',
    title: 'Back a founder, or become one',
    copy: 'Discover women-founded startups looking for support, or pitch your own idea to a community ready to invest.',
  },
  {
    name: 'Canopy',
    title: 'Lead the next generation',
    copy: 'Mentor, invest, and pass down what you have learned, the canopy that shelters the next first-year student.',
  },
]

const startupStages = ['Idea', 'Pre-seed', 'Seed', 'Series A', 'Growth']

const startups = [
  {
    name: 'Verdant Health',
    tag: 'Biotech',
    one: "Diagnostics for conditions historically under-researched in women's health.",
    meta: 'Seed - raising $500K',
    stage: 'Seed',
    detail: 'Building cheaper diagnostic panels for clinics that need faster answers and fewer referral delays.',
    people: ['Priya Anand - CEO', 'Mina Chow - Clinical Lead', 'Rachel Kim - Product'],
    jobs: [{ title: 'Clinical Research Intern', req: 'Biology background, 6 hrs/week' }],
    evaluation: {
      score: 8,
      verdict: 'Strong',
      upside: 'Clear clinical need with focused early customers.',
      risk: 'Clinical validation may slow sales.',
      next: 'Pilot with 3 local clinics.',
    },
  },
  {
    name: 'Ledger & Loom',
    tag: 'Fintech',
    one: 'Payroll infrastructure built for independent and gig-economy earners.',
    meta: 'Pre-seed - raising $250K',
    stage: 'Pre-seed',
    detail: 'Turning irregular gig payments into clear pay stubs, tax buckets, and simple savings flows.',
    people: ['Dana Okafor - Founder', 'Sofia Chen - Engineering', 'Nora Patel - Design'],
    jobs: [{ title: 'Frontend Fellow', req: 'React basics, fintech curiosity' }],
    evaluation: {
      score: 7,
      verdict: 'Promising',
      upside: 'Large worker base with repeat weekly use.',
      risk: 'Needs trust and compliance from day one.',
      next: 'Launch beta with 50 gig workers.',
    },
  },
  {
    name: 'Canopy Climate',
    tag: 'Climate',
    one: 'Carbon accounting software for small manufacturers.',
    meta: 'Series A - closed',
    stage: 'Series A',
    detail: 'Helping small manufacturers track emissions without needing a full sustainability team.',
    people: ['Lucia Reyes - CEO', 'Samira Evans - Data', 'Talia Stone - Sales'],
    jobs: [],
    evaluation: {
      score: 9,
      verdict: 'High conviction',
      upside: 'Strong regulation tailwinds and paid customers.',
      risk: 'Crowded carbon software market.',
      next: 'Expand into supplier reporting.',
    },
  },
  {
    name: 'Marrow Materials',
    tag: 'Hardware',
    one: 'Biodegradable packaging from mycelium composites.',
    meta: 'Seed - raising $400K',
    stage: 'Seed',
    detail: 'Growing protective packaging that can replace foam inserts for local shipping partners.',
    people: ['Mei Tanaka - Founder', 'Iris Cole - Lab Ops', 'Hannah Wu - Supply Chain'],
    jobs: [{ title: 'Materials Lab Assistant', req: 'Lab safety training preferred' }],
    evaluation: {
      score: 7,
      verdict: 'Promising',
      upside: 'Physical product with clear sustainability appeal.',
      risk: 'Manufacturing scale and unit cost.',
      next: 'Secure one recurring packaging buyer.',
    },
  },
  {
    name: 'Fieldnote',
    tag: 'AI',
    one: 'Voice-to-structured-data tool for fieldwork researchers.',
    meta: 'Pre-seed - raising $150K',
    stage: 'Pre-seed',
    detail: 'Converting messy field recordings into clean notes, tags, and datasets for research teams.',
    people: ['Amara Bello - Founder', 'June Ellis - ML', 'Riya Singh - Research'],
    jobs: [{ title: 'Research Ops Intern', req: 'Comfort organizing interviews' }],
    evaluation: {
      score: 8,
      verdict: 'Strong',
      upside: 'Clear workflow pain for research teams.',
      risk: 'Accuracy needs to beat general AI tools.',
      next: 'Ship export integrations.',
    },
  },
  {
    name: 'Harbor Supply Co.',
    tag: 'Consumer',
    one: 'Direct-trade sourcing platform connecting small farms to retailers.',
    meta: 'Seed - raising $300K',
    stage: 'Seed',
    detail: 'Making it easier for small farms to sell directly into neighborhood grocers and cafes.',
    people: ['Ines Duarte - CEO', 'Marta Ruiz - Partnerships', 'Leah Brooks - Operations'],
    jobs: [],
    evaluation: {
      score: 6,
      verdict: 'Early',
      upside: 'Useful local supply network if liquidity grows.',
      risk: 'Marketplace growth is slow without dense supply.',
      next: 'Concentrate on one city.',
    },
  },
]

const founders = [
  { name: 'Priya Anand', tag: 'Biotech', one: 'Ex-Genentech researcher, 2 patents pending in diagnostics.', meta: 'Austin, TX' },
  { name: 'Dana Okafor', tag: 'Fintech', one: 'Former Stripe engineer, building payroll tools for gig workers.', meta: 'Brooklyn, NY' },
  { name: 'Lucia Reyes', tag: 'Climate', one: 'Environmental engineer turned founder, MIT Climate fellow.', meta: 'Boston, MA' },
  { name: 'Mei Tanaka', tag: 'Hardware', one: 'Materials scientist, holds 1 patent in composite biomaterials.', meta: 'Seattle, WA' },
  { name: 'Amara Bello', tag: 'AI', one: 'NLP researcher, previously at a Series B applied-AI startup.', meta: 'San Francisco, CA' },
  { name: 'Ines Duarte', tag: 'Consumer', one: 'Second-time founder, exited a DTC brand in 2023.', meta: 'Chicago, IL' },
]

const starterPrompts = [
  'What is an ETF?',
  'How should a beginner start investing?',
  'What is the difference between stocks and index funds?',
  'How do I understand risk in my portfolio?',
  'How can investing support career independence?',
  'How should I think about saving vs investing?',
]

function CardGrid({ items, onSelect }) {
  return (
    <div className="grid">
      {items.map((item) => {
        const content = (
          <>
            <span className="tag">{item.tag}</span>
            <h3>{item.name}</h3>
            <p>{item.one}</p>
            <div className="meta">{item.meta}</div>
          </>
        )

        return onSelect ? (
          <button className="card startup-card" key={item.name} type="button" onClick={() => onSelect(item)}>
            {content}
          </button>
        ) : (
          <article className="card" key={item.name}>
            {content}
          </article>
        )
      })}
    </div>
  )
}

function InvestmentChatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi, I can explain investing basics in plain language. I am here for education, not personalized financial advice.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sendMessage = async (text = input) => {
    const content = text.trim()
    if (!content || loading) {
      if (!content) setError('Type a question first.')
      return
    }

    const nextMessages = [...messages, { role: 'user', content }]
    setMessages(nextMessages)
    setInput('')
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/investment-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages.slice(-8) }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'The assistant could not respond.')
      setMessages([...nextMessages, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setError(err.message || 'Something went wrong.')
      setMessages([...nextMessages, { role: 'assistant', content: 'I had trouble answering that. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="chat-page">
      <section className="chat-shell">
        <div className="chat-intro">
          <div className="label">Financial education</div>
          <h1>AI Investment Assistant</h1>
          <p>Ask questions about investing, budgeting, portfolios, and financial confidence.</p>
        </div>

        <div className="prompt-row">
          {starterPrompts.map((prompt) => (
            <button type="button" key={prompt} onClick={() => sendMessage(prompt)} disabled={loading}>
              {prompt}
            </button>
          ))}
        </div>

        <section className="chat-panel" aria-label="Investment assistant chat">
          <div className="message-list" aria-live="polite">
            {messages.map((message, index) => (
              <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
                <span>{message.role === 'user' ? 'You' : 'Rooted AI'}</span>
                <p>{message.content}</p>
              </div>
            ))}
            {loading && (
              <div className="message assistant">
                <span>Rooted AI</span>
                <p>Thinking...</p>
              </div>
            )}
          </div>

          <form className="chat-form" onSubmit={(event) => {
            event.preventDefault()
            sendMessage()
          }}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask an investment question"
              disabled={loading}
            />
            <button className="btn-outline" type="submit" disabled={loading}>Send</button>
          </form>
          {error && <p className="chat-error">{error}</p>}
        </section>
      </section>
    </main>
  )
}

function StartupModal({ startup, onClose }) {
  if (!startup) return null

  const stageIndex = startupStages.indexOf(startup.stage)
  const progress = (stageIndex / (startupStages.length - 1)) * 100
  const evaluationProgress = `${startup.evaluation.score * 10}%`

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="startup-title" onClick={(event) => event.stopPropagation()}>
        <button className="close" type="button" aria-label="Close popup" onClick={onClose}>x</button>
        <span className="tag">{startup.tag}</span>
        <h2 id="startup-title">{startup.name}</h2>
        <p>{startup.detail}</p>

        <div className="stage-box">
          <div className="stage-line">
            <span>Stage</span>
            <strong>{startup.stage}</strong>
          </div>
          <div className="progress" style={{ '--progress': `${progress}%` }}><div /></div>
          <div className="steps">
            {startupStages.map((stage, index) => (
              <span className={index <= stageIndex ? 'done' : ''} key={stage}>{stage}</span>
            ))}
          </div>
        </div>

        <div className="evaluation-box">
          <div className="stage-line">
            <span>Evaluation</span>
            <strong>{startup.evaluation.score}/10 - {startup.evaluation.verdict}</strong>
          </div>
          <div className="progress evaluation-progress" style={{ '--progress': evaluationProgress }}><div /></div>
          <ul className="plain-list evaluation-list">
            <li><strong>Upside</strong><span>{startup.evaluation.upside}</span></li>
            <li><strong>Risk</strong><span>{startup.evaluation.risk}</span></li>
            <li><strong>Next</strong><span>{startup.evaluation.next}</span></li>
          </ul>
        </div>

        <div className="modal-cols">
          <div>
            <h3>Team</h3>
            <ul className="plain-list">
              {startup.people.map((person) => <li key={person}>{person}</li>)}
            </ul>
          </div>

          <div>
            <h3>Job Openings</h3>
            {startup.jobs.length ? (
              <ul className="plain-list jobs">
                {startup.jobs.map((job) => (
                  <li key={job.title}>
                    <strong>{job.title}</strong>
                    <span>Req: {job.req}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty">No roles posted right now.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function Tree() {
  const wrapRef = useRef(null)
  const trackRef = useRef(null)
  const pathRefs = useRef({})
  const [active, setActive] = useState(0)

  useEffect(() => {
    const paths = pathRefs.current
    const branches = ['branchL1', 'branchR1', 'branchL2', 'branchR2', 'branchL3', 'branchR3']
    const lengths = {}

    ;['trunk', ...branches].forEach((id) => {
      const path = paths[id]
      const length = path.getTotalLength()
      lengths[id] = length
      path.style.strokeDasharray = length
      path.style.strokeDashoffset = length
    })

    const update = () => {
      const wrap = wrapRef.current
      if (!wrap) return

      const rect = wrap.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const progress = Math.max(0, Math.min(1, -rect.top / total))
      const stageHeight = window.matchMedia('(max-width: 860px)').matches ? 260 : 230
      const trackY = -progress * (stages.length - 1) * stageHeight

      trackRef.current.style.transform = `translateY(${trackY}px)`
      setActive(Math.min(stages.length - 1, Math.round(progress * (stages.length - 1))))

      paths.root1.style.opacity = 0.4 * (1 - Math.min(progress / 0.15, 1))
      paths.root2.style.opacity = 0.4 * (1 - Math.min(progress / 0.15, 1))
      paths.trunk.style.strokeDashoffset = lengths.trunk * (1 - Math.min(progress / 0.3, 1))

      branches.forEach((id, index) => {
        const start = 0.28 + index * 0.05
        const draw = Math.min(Math.max((progress - start) / 0.22, 0), 1)
        paths[id].style.strokeDashoffset = lengths[id] * (1 - draw)
      })

      paths.marks.style.opacity = Math.min(Math.max((progress - 0.55) / 0.35, 0), 1)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <section className="growth-wrap" id="growth" ref={wrapRef}>
      <div className="growth-pin">
        <div className="growth-left">
          <div className="chapter-rail">
            {stages.map((stage, index) => (
              <div className="dot-row" key={stage.name}>
                <div className={`dot ${active === index ? 'active' : ''}`} />
                <span className={`rname ${active === index ? 'active' : ''}`}>{stage.name}</span>
              </div>
            ))}
          </div>

          <div className="text-viewport">
            <div className="text-track" ref={trackRef}>
              {stages.map((stage, index) => (
                <div className={`stage ${active === index ? 'active' : ''}`} key={stage.name}>
                  <h2>{stage.title}</h2>
                  <p>{stage.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="growth-right">
          <svg width="360" height="600" viewBox="0 0 360 600" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="180" cy="560" r="24" stroke="#5F7A57" strokeWidth="1" opacity="0.25" />
            <circle cx="180" cy="560" r="40" stroke="#5F7A57" strokeWidth="1" opacity="0.15" />
            <circle cx="180" cy="560" r="56" stroke="#5F7A57" strokeWidth="1" opacity="0.08" />
            <path ref={(el) => { pathRefs.current.root1 = el }} d="M180 560 C 160 568, 135 572, 108 574" stroke="#55402F" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
            <path ref={(el) => { pathRefs.current.root2 = el }} d="M180 560 C 200 568, 225 572, 252 574" stroke="#55402F" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
            <path ref={(el) => { pathRefs.current.trunk = el }} d="M180 560 C 178 470, 182 380, 180 250" stroke="#55402F" strokeWidth="3" strokeLinecap="round" />
            <path ref={(el) => { pathRefs.current.branchL1 = el }} d="M180 450 C 145 432, 112 415, 86 380" stroke="#5F7A57" strokeWidth="2" strokeLinecap="round" />
            <path ref={(el) => { pathRefs.current.branchR1 = el }} d="M180 430 C 215 412, 245 398, 275 365" stroke="#5F7A57" strokeWidth="2" strokeLinecap="round" />
            <path ref={(el) => { pathRefs.current.branchL2 = el }} d="M180 360 C 148 338, 122 315, 106 280" stroke="#5F7A57" strokeWidth="1.8" strokeLinecap="round" />
            <path ref={(el) => { pathRefs.current.branchR2 = el }} d="M180 340 C 210 318, 232 300, 254 268" stroke="#5F7A57" strokeWidth="1.8" strokeLinecap="round" />
            <path ref={(el) => { pathRefs.current.branchL3 = el }} d="M180 290 C 160 268, 144 246, 136 214" stroke="#5F7A57" strokeWidth="1.5" strokeLinecap="round" />
            <path ref={(el) => { pathRefs.current.branchR3 = el }} d="M180 280 C 202 258, 220 240, 232 208" stroke="#5F7A57" strokeWidth="1.5" strokeLinecap="round" />
            <g ref={(el) => { pathRefs.current.marks = el }} opacity="0">
              <rect x="80" y="374" width="9" height="9" fill="#B0677A" transform="rotate(45 84.5 378.5)" />
              <rect x="270" y="359" width="8" height="8" fill="#8FA187" transform="rotate(45 274 363)" />
              <rect x="100" y="274" width="9" height="9" fill="#8FA187" transform="rotate(45 104.5 278.5)" />
              <rect x="249" y="262" width="8" height="8" fill="#B0677A" transform="rotate(45 253 266)" />
              <rect x="130" y="208" width="8" height="8" fill="#D6A6B0" transform="rotate(45 134 212)" />
              <rect x="226" y="202" width="7" height="7" fill="#5F7A57" transform="rotate(45 229.5 205.5)" />
              <rect x="175" y="178" width="11" height="11" fill="#B0677A" transform="rotate(45 180.5 183.5)" />
              <rect x="155" y="222" width="7" height="7" fill="#5F7A57" transform="rotate(45 158.5 225.5)" />
              <rect x="213" y="228" width="6" height="6" fill="#D6A6B0" transform="rotate(45 216 231)" />
              <rect x="177" y="248" width="8" height="8" fill="#8FA187" transform="rotate(45 181 252)" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  )
}

function App() {
  const [tab, setTab] = useState('investors')
  const [query, setQuery] = useState('')
  const [selectedStartup, setSelectedStartup] = useState(null)
  const q = query.toLowerCase()
  const isChatbot = window.location.pathname.startsWith('/investment-chatbot')

  return (
    <>
      <nav>
        <a className="word" href="/">Rooted</a>
        <ul>
          {isChatbot ? (
            <li><a href="/">Home</a></li>
          ) : (
            <>
              <li><a href="#growth">Journey</a></li>
              <li><a href="#directory">Directory</a></li>
              <li><a href="/investment-chatbot">AI Assistant</a></li>
              <li><a href="#cta">Start</a></li>
            </>
          )}
        </ul>
      </nav>

      {isChatbot ? (
        <InvestmentChatbot />
      ) : (
        <>
          <main>
            <section className="hero">
              <div className="index">Chapter 00 - Begin</div>
              <h1>Every first money move <em>starts small.</em></h1>
              <p>A place for first-generation earners to learn, invest, and back each other, built for the moment finances, career, and independence all arrive at once.</p>
              <div className="hero-foot">
                <div className="scroll"><span>Scroll to grow</span><div className="line" /></div>
                <span className="label">2026</span>
              </div>
            </section>

            <Tree />

            <section className="directory" id="directory">
              <div className="dir-head">
                <div>
                  <div className="label">Directory</div>
                  <h2>Find who you are building with</h2>
                </div>
              </div>

              <div className="tabs">
                <button className={`tab ${tab === 'investors' ? 'active' : ''}`} onClick={() => setTab('investors')}>For investors</button>
                <button className={`tab ${tab === 'founders' ? 'active' : ''}`} onClick={() => setTab('founders')}>For founders</button>
              </div>

              {tab === 'investors' ? (
                <div>
                  <div className="search-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#55402F" strokeWidth="1.6" aria-hidden="true"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search startups or founders" />
                  </div>

                  <div className="subhead">Startup directory</div>
                  <CardGrid items={startups.filter((item) => item.name.toLowerCase().includes(q))} onSelect={setSelectedStartup} />

                  <div className="subhead">Founder directory</div>
                  <CardGrid items={founders.filter((item) => item.name.toLowerCase().includes(q))} />
                </div>
              ) : (
                <div>
                  <div className="founder-banner">
                    <div>
                      <div className="stat">12.8%</div>
                      <div className="stat-copy">Of U.S. patent inventors are women. <span className="src">Source: USPTO, Progress and Potential, 2019 data</span></div>
                    </div>
                    <button className="btn-outline">Start your journey</button>
                  </div>
                  <p className="founder-copy">Submit your idea, get a novelty check against existing patents and products, and reach investors who are looking for exactly what you are building.</p>
                </div>
              )}
            </section>

            <section className="cta" id="cta">
              <div className="row">
                <div>
                  <div className="label cta-label">Ready when you are</div>
                  <h2>Plant something today.</h2>
                  <p>Ten minutes to set up your profile. A lifetime of compounding.</p>
                </div>
                <button className="btn-outline">Get started</button>
              </div>
              <footer>
                <span>Rooted, 2026</span>
                <span>Built for first-generation earners and founders</span>
              </footer>
            </section>
          </main>
          <StartupModal startup={selectedStartup} onClose={() => setSelectedStartup(null)} />
        </>
      )}
    </>
  )
}

export default App
