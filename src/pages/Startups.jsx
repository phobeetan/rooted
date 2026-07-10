import { useState } from 'react'
import StartupModal from '../components/StartupModal.jsx'
import { startups } from '../data/rootedData.js'

const stages = ['All stages', ...new Set(startups.map((startup) => startup.stage))]
const categories = ['All categories', ...new Set(startups.map((startup) => startup.tag))]

function Startups() {
  const [stage, setStage] = useState('All stages')
  const [category, setCategory] = useState('All categories')
  const [selectedStartup, setSelectedStartup] = useState(null)

  const filtered = startups.filter((startup) => (
    (stage === 'All stages' || startup.stage === stage)
    && (category === 'All categories' || startup.tag === category)
  ))

  return (
    <>
      <main className="startups-page">
        <section className="page-shell">
          <div className="page-head">
            <p className="label">YC-style directory</p>
            <h1>Women-led startups</h1>
            <p>Discover startups founded or co-founded by women and track their growth stage.</p>
          </div>

          <section className="filter-row" aria-label="Startup filters">
            <label className="field">
              Stage
              <select value={stage} onChange={(event) => setStage(event.target.value)}>
                {stages.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label className="field">
              Category
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {categories.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
          </section>

          <section className="startup-list" aria-label="Women-led startups">
            {filtered.map((startup) => (
              <button className="startup-card" type="button" key={startup.name} onClick={() => setSelectedStartup(startup)}>
                <div className="startup-card-head">
                  <div>
                    <h2>{startup.name}</h2>
                    <p>{startup.people[0]}</p>
                  </div>
                  <span>{startup.stage}</span>
                </div>
                <p>{startup.one}</p>
                <div className="startup-tags">
                  <strong>{startup.tag}</strong>
                  <div><span>{startup.meta}</span></div>
                </div>
              </button>
            ))}
          </section>

          <section className="submit-panel">
            <div>
              <h2>Submit a women-led startup</h2>
              <p>Submission form coming soon. For now, this is a hackathon placeholder.</p>
            </div>
            <button className="btn-outline" type="button" disabled>Submit</button>
          </section>
        </section>
      </main>

      <StartupModal startup={selectedStartup} onClose={() => setSelectedStartup(null)} />
    </>
  )
}

export default Startups
