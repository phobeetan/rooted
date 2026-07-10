import { useEffect, useState } from 'react'

function useCountUp(target, decimals, active) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) {
      setValue(0)
      return undefined
    }

    let start
    let frame
    const step = (time) => {
      if (start === undefined) start = time
      const progress = Math.min((time - start) / 1000, 1)
      setValue(target * progress)
      if (progress < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [active, target])

  return value.toFixed(decimals)
}

function StatSlide({ stat, active }) {
  const value = useCountUp(stat.target, stat.decimals, active)

  return (
    <article className="stat-slide" aria-hidden={!active}>
      <p className="label">The numbers</p>
      <strong>{value}{stat.suffix}</strong>
      <p>{stat.label}</p>
      <small>{stat.source}</small>
    </article>
  )
}

function StatCarousel({ slides }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return undefined
    const id = setInterval(() => setIndex((current) => (current + 1) % slides.length), 5000)
    return () => clearInterval(id)
  }, [paused, slides.length])

  const go = (next) => setIndex((next + slides.length) % slides.length)

  return (
    <section className="stat-carousel" aria-label="Funding statistics">
      <div className="stat-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((stat, slideIndex) => (
          <StatSlide stat={stat} active={slideIndex === index} key={stat.source} />
        ))}
      </div>
      <div className="carousel-controls">
        <button type="button" onClick={() => go(index - 1)}>Prev</button>
        <div className="carousel-dots">
          {slides.map((stat, dotIndex) => (
            <button
              aria-label={`Go to slide ${dotIndex + 1}`}
              className={dotIndex === index ? 'active' : ''}
              key={stat.source}
              type="button"
              onClick={() => go(dotIndex)}
            />
          ))}
        </div>
        <button type="button" onClick={() => go(index + 1)}>Next</button>
        <button type="button" onClick={() => setPaused((current) => !current)}>
          {paused ? 'Play' : 'Pause'}
        </button>
      </div>
    </section>
  )
}

export default StatCarousel
