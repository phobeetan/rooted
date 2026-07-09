import './App.css'

const features = [
  {
    title: 'Auth',
    description: 'Login, signup, and user session work.',
  },
  {
    title: 'Dashboard',
    description: 'Main user view and shared layout.',
  },
  {
    title: 'Data',
    description: 'API calls, storage, and app state.',
  },
]

function App() {
  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">Hackathon Starter</p>
        <h1>Rooted</h1>
        <p className="heroText">
          A small React app ready for teammates to split work across branches.
        </p>
      </section>

      <section className="features" aria-label="Feature areas">
        {features.map((feature) => (
          <article className="featureCard" key={feature.title}>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>
    </main>
  )
}

export default App
