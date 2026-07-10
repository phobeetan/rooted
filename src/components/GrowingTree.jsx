import { useEffect, useRef, useState } from 'react'
import { growthStages } from '../data/rootedData.js'

const branches = ['branchL1', 'branchR1', 'branchL2', 'branchR2', 'branchL3', 'branchR3']
const drawIds = ['trunk', ...branches]

function GrowingTree() {
  const wrapRef = useRef(null)
  const trackRef = useRef(null)
  const paths = useRef({})
  const [active, setActive] = useState(0)

  useEffect(() => {
    const lengths = {}
    drawIds.forEach((id) => {
      const path = paths.current[id]
      lengths[id] = path.getTotalLength()
      path.style.strokeDasharray = lengths[id]
      path.style.strokeDashoffset = lengths[id]
    })

    const update = () => {
      const wrap = wrapRef.current
      const track = trackRef.current
      if (!wrap || !track) return

      const rect = wrap.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const progress = Math.max(0, Math.min(1, -rect.top / total))
      const stageHeight = window.matchMedia('(max-width: 860px)').matches ? 260 : 230

      track.style.transform = `translateY(${-progress * (growthStages.length - 1) * stageHeight}px)`
      setActive(Math.min(growthStages.length - 1, Math.round(progress * (growthStages.length - 1))))

      paths.current.root1.style.opacity = 0.42 * (1 - Math.min(progress / 0.16, 1))
      paths.current.root2.style.opacity = 0.42 * (1 - Math.min(progress / 0.16, 1))
      paths.current.trunk.style.strokeDashoffset = lengths.trunk * (1 - Math.min(progress / 0.32, 1))

      branches.forEach((id, index) => {
        const start = 0.27 + index * 0.055
        const draw = Math.min(Math.max((progress - start) / 0.22, 0), 1)
        paths.current[id].style.strokeDashoffset = lengths[id] * (1 - draw)
      })

      paths.current.buds.style.opacity = Math.min(Math.max((progress - 0.52) / 0.32, 0), 1)
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
            {growthStages.map((stage, index) => (
              <div className="dot-row" key={stage.name}>
                <span className={`dot ${active === index ? 'active' : ''}`} />
                <span className={`rname ${active === index ? 'active' : ''}`}>{stage.name}</span>
              </div>
            ))}
          </div>

          <div className="text-viewport">
            <div className="text-track" ref={trackRef}>
              {growthStages.map((stage, index) => (
                <div className={`growth-stage ${active === index ? 'active' : ''}`} key={stage.name}>
                  <h2>{stage.title}</h2>
                  <p>{stage.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="growth-right">
          <svg width="360" height="600" viewBox="0 0 360 600" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="180" cy="560" r="24" stroke="var(--sage)" strokeWidth="1" opacity="0.25" />
            <circle cx="180" cy="560" r="42" stroke="var(--sage)" strokeWidth="1" opacity="0.14" />
            <circle cx="180" cy="560" r="60" stroke="var(--sage)" strokeWidth="1" opacity="0.08" />
            <path ref={(el) => { paths.current.root1 = el }} d="M180 560 C 160 568, 135 572, 108 574" stroke="var(--root)" strokeWidth="1.5" strokeLinecap="round" opacity="0.42" />
            <path ref={(el) => { paths.current.root2 = el }} d="M180 560 C 200 568, 225 572, 252 574" stroke="var(--root)" strokeWidth="1.5" strokeLinecap="round" opacity="0.42" />
            <path ref={(el) => { paths.current.trunk = el }} d="M180 560 C 178 470, 182 380, 180 250" stroke="var(--root)" strokeWidth="3" strokeLinecap="round" />
            <path ref={(el) => { paths.current.branchL1 = el }} d="M180 450 C 145 432, 112 415, 86 380" stroke="var(--sage)" strokeWidth="2" strokeLinecap="round" />
            <path ref={(el) => { paths.current.branchR1 = el }} d="M180 430 C 215 412, 245 398, 275 365" stroke="var(--sage)" strokeWidth="2" strokeLinecap="round" />
            <path ref={(el) => { paths.current.branchL2 = el }} d="M180 360 C 148 338, 122 315, 106 280" stroke="var(--sage)" strokeWidth="1.8" strokeLinecap="round" />
            <path ref={(el) => { paths.current.branchR2 = el }} d="M180 340 C 210 318, 232 300, 254 268" stroke="var(--sage)" strokeWidth="1.8" strokeLinecap="round" />
            <path ref={(el) => { paths.current.branchL3 = el }} d="M180 290 C 160 268, 144 246, 136 214" stroke="var(--sage)" strokeWidth="1.5" strokeLinecap="round" />
            <path ref={(el) => { paths.current.branchR3 = el }} d="M180 280 C 202 258, 220 240, 232 208" stroke="var(--sage)" strokeWidth="1.5" strokeLinecap="round" />
            <g ref={(el) => { paths.current.buds = el }} opacity="0">
              <rect x="80" y="374" width="9" height="9" fill="var(--rose)" transform="rotate(45 84.5 378.5)" />
              <rect x="270" y="359" width="8" height="8" fill="var(--leaf)" transform="rotate(45 274 363)" />
              <rect x="100" y="274" width="9" height="9" fill="var(--leaf)" transform="rotate(45 104.5 278.5)" />
              <rect x="249" y="262" width="8" height="8" fill="var(--rose)" transform="rotate(45 253 266)" />
              <rect x="130" y="208" width="8" height="8" fill="var(--petal)" transform="rotate(45 134 212)" />
              <rect x="226" y="202" width="7" height="7" fill="var(--sage)" transform="rotate(45 229.5 205.5)" />
              <rect x="175" y="178" width="11" height="11" fill="var(--rose)" transform="rotate(45 180.5 183.5)" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  )
}

export default GrowingTree
