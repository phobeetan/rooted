import { useState } from 'react'
import { mockFidelity } from '../data/rootedData.js'

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const pct = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const ALLOCATION_COLORS = {
  stock: 'var(--sage)',
  etf: 'var(--root)',
  'mutual fund': 'var(--rose)',
  cash: 'var(--petal)',
}

function signedUsd(value) {
  const formatted = usd.format(Math.abs(value))
  return value >= 0 ? `+${formatted}` : `−${formatted}`
}

function signedPct(value) {
  const formatted = pct.format(Math.abs(value))
  return value >= 0 ? `+${formatted}%` : `−${formatted}%`
}

function changeClass(value) {
  return value >= 0 ? 'up' : 'down'
}

function MockFidelity() {
  const [status, setStatus] = useState('')
  const { performance } = mockFidelity
  const totalValue = mockFidelity.accounts.reduce((sum, account) => sum + account.value, 0)
  const totalCash = mockFidelity.accounts.reduce((sum, account) => sum + account.cash, 0)
  const invested = totalValue - totalCash
  const positions = mockFidelity.accounts.flatMap((account) =>
    account.positions.map((position) => ({
      account: account.type,
      ...position,
    })),
  )

  const allocationTotals = positions.reduce(
    (totals, position) => {
      totals[position.type] = (totals[position.type] || 0) + position.value
      return totals
    },
    { cash: totalCash },
  )
  const allocationSum = Object.values(allocationTotals).reduce((sum, value) => sum + value, 0)
  const allocationSegments = Object.entries(allocationTotals)
    .filter(([, value]) => value > 0)
    .map(([type, value]) => ({
      type,
      value,
      pct: (value / allocationSum) * 100,
      color: ALLOCATION_COLORS[type] || 'var(--muted)',
    }))

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

        <div className="metric-grid">
          <div>
            <span>Day change</span>
            <strong className={changeClass(performance.dayChange)}>
              {signedUsd(performance.dayChange)} ({signedPct(performance.dayChangePct)})
            </strong>
          </div>
          <div>
            <span>Total gain / loss</span>
            <strong className={changeClass(performance.totalGain)}>
              {signedUsd(performance.totalGain)} ({signedPct(performance.totalGainPct)})
            </strong>
          </div>
          <div><span>Invested</span><strong>{usd.format(invested)}</strong></div>
          <div><span>Market value vs cash</span><strong>{usd.format(invested)} / {usd.format(totalCash)}</strong></div>
        </div>

        <section className="panel">
          <h2>Holdings<span>Positions across all linked accounts</span></h2>
          <div className="mock-table-wrap">
            <table className="mock-table holdings-table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Shares</th>
                  <th>Value</th>
                  <th>Cost basis</th>
                  <th>Gain / loss</th>
                  <th>Day change</th>
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
                    <td>{position.shares}</td>
                    <td>{usd.format(position.value)}</td>
                    <td>{usd.format(position.costBasis)}</td>
                    <td className={changeClass(position.gainLoss)}>
                      {signedUsd(position.gainLoss)} ({signedPct(position.gainLossPct)})
                    </td>
                    <td className={changeClass(position.dayChange)}>
                      {signedUsd(position.dayChange)} ({signedPct(position.dayChangePct)})
                    </td>
                    <td>{position.allocation.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <h2>Asset allocation<span>Breakdown by asset type</span></h2>
          <div className="allocation-bar" aria-hidden="true">
            {allocationSegments.map((segment) => (
              <div
                key={segment.type}
                className="allocation-segment"
                style={{ width: `${segment.pct}%`, background: segment.color }}
              />
            ))}
          </div>
          <div className="metric-grid allocation-legend">
            {allocationSegments.map((segment) => (
              <div key={segment.type}>
                <span>
                  <i className="allocation-swatch" style={{ background: segment.color }} />
                  {segment.type}
                </span>
                <strong>{pct.format(segment.pct)}% · {usd.format(segment.value)}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Account details<span>Settled cash vs. cash available to trade</span></h2>
          <div className="metric-grid account-details-grid">
            {mockFidelity.accounts.map((account) => (
              <div key={account.type} className="account-detail">
                <span>{account.type}</span>
                <strong>{account.accountNumber}</strong>
                <p>Settled cash · {usd.format(account.settledCash)}</p>
                <p>Available to trade · {usd.format(account.cashAvailableToTrade)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Recent activity<span>Mock transaction history</span></h2>
          <div className="mock-table-wrap">
            <table className="mock-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Symbol</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {mockFidelity.recentActivity.map((row) => (
                  <tr key={`${row.date}-${row.type}-${row.symbol}-${row.amount}`}>
                    <td>{row.date}</td>
                    <td>{row.type}</td>
                    <td>{row.symbol}</td>
                    <td className={changeClass(row.amount)}>{signedUsd(row.amount)}</td>
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
