import { useState } from 'react'

const startups = [
  {
    name: 'Lumina Health',
    founders: ['Aisha Khan'],
    description: "AI-powered care navigation for women's health.",
    category: 'Health',
    stage: 'Seed',
    tags: ['AI', 'Health', "Women's Health"],
  },
  {
    name: 'FinRise',
    founders: ['Maya Patel', 'Sofia Chen'],
    description: 'Financial tools helping early-career women build investing confidence.',
    category: 'Fintech',
    stage: 'Pre-seed',
    tags: ['Fintech', 'Investing', 'Career'],
  },
  {
    name: 'ClassBloom',
    founders: ['Nora Williams'],
    description: 'Simple classroom planning tools for independent tutors and micro-schools.',
    category: 'Education',
    stage: 'MVP',
    tags: ['Education', 'SaaS'],
  },
  {
    name: 'LoopCraft',
    founders: ['Elena Garcia', 'Priya Mehta'],
    description: 'No-code workflow templates for small ecommerce teams.',
    category: 'Productivity',
    stage: 'Series A',
    tags: ['No-code', 'Ecommerce'],
  },
  {
    name: 'CareNest',
    founders: ['Jasmine Reed'],
    description: 'A care coordination app for families managing elder care.',
    category: 'Health',
    stage: 'Idea',
    tags: ['Health', 'Family'],
  },
  {
    name: 'GreenLedger',
    founders: ['Amara Okafor'],
    description: 'Carbon tracking and reporting for growing local businesses.',
    category: 'Climate',
    stage: 'Growth',
    tags: ['Climate', 'B2B'],
  },
]

const stages = ['All stages', ...new Set(startups.map((startup) => startup.stage))]
const categories = ['All categories', ...new Set(startups.map((startup) => startup.category))]

function Startups() {
  const [stage, setStage] = useState('All stages')
  const [category, setCategory] = useState('All categories')

  const filtered = startups.filter((startup) => (
    (stage === 'All stages' || startup.stage === stage)
    && (category === 'All categories' || startup.category === category)
  ))

  return (
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
            <article className="startup-card" key={startup.name}>
              <div className="startup-card-head">
                <div>
                  <h2>{startup.name}</h2>
                  <p>{startup.founders.join(', ')}</p>
                </div>
                <span>{startup.stage}</span>
              </div>
              <p>{startup.description}</p>
              <div className="startup-tags">
                <strong>{startup.category}</strong>
                <div>
                  {startup.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </div>
            </article>
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
  )
}

export default Startups
