import { useState } from 'react'
import './App.css'

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

function App() {
  const [stage, setStage] = useState('All stages')
  const [category, setCategory] = useState('All categories')

  const filteredStartups = startups.filter((startup) => {
    return (
      (stage === 'All stages' || startup.stage === stage) &&
      (category === 'All categories' || startup.category === category)
    )
  })

  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">YC-style directory</p>
        <h1>Women-Led Startups</h1>
        <p className="heroText">
          Discover startups founded or co-founded by women and track their growth stage.
        </p>
      </section>

      <section className="filters" aria-label="Startup filters">
        <label>
          Stage
          <select value={stage} onChange={(event) => setStage(event.target.value)}>
            {stages.map((stageOption) => (
              <option key={stageOption}>{stageOption}</option>
            ))}
          </select>
        </label>

        <label>
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((categoryOption) => (
              <option key={categoryOption}>{categoryOption}</option>
            ))}
          </select>
        </label>
      </section>

      <section className="startupList" aria-label="Women-led startups">
        {filteredStartups.map((startup) => (
          <article className="startupCard" key={startup.name}>
            <div className="startupHeader">
              <div>
                <h2>{startup.name}</h2>
                <p>{startup.founders.join(', ')}</p>
              </div>
              <span>{startup.stage}</span>
            </div>

            <p className="description">{startup.description}</p>

            <div className="meta">
              <strong>{startup.category}</strong>
              <div>
                {startup.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="submit">
        <div>
          <h2>Submit a Women-Led Startup</h2>
          <p>Submission form coming soon. For now, this is a hackathon placeholder.</p>
        </div>
        <button disabled>Submit a Women-Led Startup</button>
      </section>
    </main>
  )
}

export default App
