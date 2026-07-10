import { useState } from 'react'

function MockImportPreview() {
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState('')

  async function loadImport() {
    setError('')
    try {
      const response = await fetch('/api/mock-fidelity/import')
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Request failed')
      setPayload(result.data)
    } catch {
      setPayload(null)
      setError('No mock Fidelity data has been received yet.')
    }
  }

  return (
    <main className="mock-page">
      <section className="page-shell narrow">
        <div className="page-head split">
          <div>
            <p className="label">Rooted receiver</p>
            <h1>Last Mock Fidelity Import</h1>
            <p>Shows the last mock brokerage payload received during this dev session.</p>
          </div>
          <button className="btn-outline" type="button" onClick={loadImport}>Load Last Import</button>
        </div>
        {error && <p className="note error-text">{error}</p>}
        {payload && <pre className="mock-payload">{JSON.stringify(payload, null, 2)}</pre>}
      </section>
    </main>
  )
}

export default MockImportPreview
