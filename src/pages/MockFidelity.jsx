import { useState } from 'react'
import { mockFidelity } from '../data/rootedData.js'

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function MockFidelity() {
  const [status, setStatus] = useState('')
  const totalValue = mockFidelity.accounts.reduce((sum, account) => sum + account.value, 0)
  const totalCash = mockFidelity.accounts.reduce((sum, account) => sum + account.cash, 0)
  const positions = mockFidelity.accounts.flatMap((account) =>
    account.positions.map(([symbol, name, type, value, allocation]) => ({
      account: account.type,
      symbol,
      name,
      type,
      value,
      allocation,
    })),
  )

  async function sendMockData() {
    setStatus('sending')
    try {
      const response = await fetch('/api/mock-fidelity/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...mockFidelity, syncedAt: new Date().toISOString() }),
      })
      if (!response.ok) throw new Error('Request failed')
      setStatus('sent')
    } catch {
      setStatus('failed')
    }
  }

  return (
    <main className="mock-page">
      <section className="page-shell">
        <div className="page-head split">
          <div>
            <p className="label">Fake brokerage demo</p>
            <h1>Mock Fidelity Account</h1>
            <p>Local demo data only. No Fidelity login or real account connection is used.</p>
          </div>
          <button className="btn-outline" type="button" onClick={sendMockData} disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending...' : 'Send Data'}
          </button>
        </div>

        {status === 'sent' && <p className="note">Mock Fidelity data sent to Rooted.</p>}
        {status === 'failed' && <p className="note error-text">Failed to send mock Fidelity data.</p>}

        <div className="metric-grid">
          <div><span>Account holder</span><strong>{mockFidelity.accountHolder}</strong></div>
          <div><span>Total value</span><strong>{usd.format(totalValue)}</strong></div>
          <div><span>Cash</span><strong>{usd.format(totalCash)}</strong></div>
          <div><span>Accounts</span><strong>{mockFidelity.accounts.length}</strong></div>
        </div>

        <section className="panel">
          <div className="mock-table-wrap">
            <table className="mock-table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Allocation</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position) => (
                  <tr key={`${position.account}-${position.symbol}`}>
                    <td>{position.account}</td>
                    <td>{position.symbol}</td>
                    <td>{position.name}</td>
                    <td>{position.type}</td>
                    <td>{usd.format(position.value)}</td>
                    <td>{position.allocation.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  )
}

export default MockFidelity
