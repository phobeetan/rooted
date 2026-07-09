import { useEffect, useState } from 'react'
import '../App.css'

const stats = [
  {
    target: 1,
    decimals: 0,
    suffix: '%',
    label: 'of all U.S. VC funding in 2024 went to startups with all-women founding teams — down from 2% in 2023.',
    source: 'PitchBook, 2024 US All In Report',
  },
  {
    target: 15,
    decimals: 0,
    suffix: '%',
    label: "of Y Combinator's Summer 2022 batch had a woman founder.",
    source: 'Y Combinator / TechCrunch, 2022',
  },
  {
    target: 19.9,
    decimals: 1,
    suffix: '%',
    label: 'of total U.S. VC deal value went to startups with at least one female founder in 2024, down from 20.8% in 2023.',
    source: 'PitchBook, 2024 US All In Report',
  },
]

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

function useCountUp(target, decimals, active, duration = 1200) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) {
      setValue(0)
      return undefined
    }

    let start
    let frame

    const step = (timestamp) => {
      if (start === undefined) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      setValue(target * progress)
      if (progress < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [active, target, duration])

  return value.toFixed(decimals)
}

function useTypewriter(text, speed = 35) {
  const [output, setOutput] = useState('')

  useEffect(() => {
    setOutput('')
    let i = 0
    const id = setInterval(() => {
      i += 1
      setOutput(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  return output
}

function StatSlide({ stat, active }) {
  const displayValue = useCountUp(stat.target, stat.decimals, active)

  return (
    <article className="slide slideStat" aria-hidden={!active}>
      <p className="slideEyebrow">The Numbers</p>
      <p className="slideStatValue">
        {displayValue}
        {stat.suffix}
      </p>
      <p className="slideStatLabel">{stat.label}</p>
      <p className="slideSource">{stat.source}</p>
    </article>
  )
}

function Carousel({ slides }) {
  const slideCount = slides.length
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return undefined
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % slideCount)
    }, 5000)
    return () => clearInterval(id)
  }, [paused, slideCount])

  const goTo = (next) => setIndex((next + slideCount) % slideCount)

  return (
    <section
      className="carousel"
      aria-label="Stats"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className="carouselTrack"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((stat, slideIndex) => (
          <StatSlide
            stat={stat}
            active={index === slideIndex}
            key={stat.target + stat.source}
          />
        ))}
      </div>

      <div className="carouselControls">
        <button
          type="button"
          className="carouselArrow"
          aria-label="Previous slide"
          onClick={() => goTo(index - 1)}
        >
          ‹
        </button>

        <div className="carouselDots" role="tablist" aria-label="Slide selector">
          {Array.from({ length: slideCount }).map((_, dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              role="tab"
              aria-selected={dotIndex === index}
              aria-label={`Go to slide ${dotIndex + 1}`}
              className={`carouselDot${dotIndex === index ? ' carouselDotActive' : ''}`}
              onClick={() => goTo(dotIndex)}
            />
          ))}
        </div>

        <button
          type="button"
          className="carouselArrow"
          aria-label="Next slide"
          onClick={() => goTo(index + 1)}
        >
          ›
        </button>

        <button
          type="button"
          className="carouselPause"
          aria-label={paused ? 'Resume auto-rotate' : 'Pause auto-rotate'}
          onClick={() => setPaused((current) => !current)}
        >
          {paused ? '▶' : '❚❚'}
        </button>
      </div>
    </section>
  )
}

function Home() {
  const [userName] = useState(() => localStorage.getItem('userName') || '')
  const heroText = 'Your personalized wealth blueprint is ready.'
  const typedHeroText = useTypewriter(heroText)

  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">Rooted</p>
        <h1>{userName ? `Welcome, ${userName}!` : 'Welcome!'}</h1>
        <p className="heroText" aria-label={heroText}>
          <span aria-hidden="true">{typedHeroText}</span>
          <span className="typewriterCursor" aria-hidden="true" />
        </p>
      </section>

      <Carousel slides={stats} />

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

export default Home
