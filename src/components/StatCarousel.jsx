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
      <div className="stat-bar" aria-hidden="true">
        <div style={{ width: `${active ? Math.min(stat.target, 100) : 0}%` }} />
      </div>
      <p>{stat.label}</p>
      <small>{stat.source}</small>
    </article>
  )
}

function StatCarousel({ slides }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex((current) => (current + 1) % slides.length), 5000)
    return () => clearInterval(id)
  }, [slides.length])

  return (
    <section className="stat-carousel" aria-label="Funding statistics">
      <div className="stat-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((stat, slideIndex) => (
          <StatSlide stat={stat} active={slideIndex === index} key={`${stat.source}-${slideIndex}`} />
        ))}
      </div>
    </section>
  )
}

export default StatCarousel
