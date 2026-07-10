import { startupStages } from '../data/rootedData.js'

function StartupModal({ startup, onClose }) {
  if (!startup) return null

  const stageIndex = startupStages.indexOf(startup.stage)
  const progress = (stageIndex / (startupStages.length - 1)) * 100

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

        <div className="stage-box muted">
          <div className="stage-line">
            <span>Evaluation</span>
            <strong>{startup.evaluation.score}/10 - {startup.evaluation.verdict}</strong>
          </div>
          <div className="progress sage-progress" style={{ '--progress': `${startup.evaluation.score * 10}%` }}><div /></div>
          <ul className="plain-list">
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
              <ul className="plain-list">
                {startup.jobs.map((job) => (
                  <li key={job.title}><strong>{job.title}</strong><span>{job.req}</span></li>
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

export default StartupModal
