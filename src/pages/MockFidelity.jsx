import { useEffect, useState } from 'react'
import { womenLedStocks } from '../womenLedStocks.js'
import { getInvestments, saveInvestments } from '../../scripts/services/supabaseService.js'
import { buildMockFidelityPortfolio, readTradeState } from '../services/tradePortfolio.js'

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const pct = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const ALLOCATION_COLORS = {
  stock: 'var(--sage)',
  crypto: 'var(--forest)',
  etf: 'var(--root)',
  'mutual fund': 'var(--rose)',
  cash: 'var(--petal)',
}

function formatUsd(value) {
  return Number.isFinite(value) ? usd.format(value) : '—'
}

function signedUsd(value) {
  if (!Number.isFinite(value)) return '—'
  const formatted = usd.format(Math.abs(value))
  return value >= 0 ? `+${formatted}` : `−${formatted}`
}

function signedPct(value) {
  if (!Number.isFinite(value)) return ''
  const formatted = pct.format(Math.abs(value))
  return value >= 0 ? `+${formatted}%` : `−${formatted}%`
}

function changeClass(value) {
  if (!Number.isFinite(value)) return ''
  return value >= 0 ? 'up' : 'down'
}

function formatChange(value, percent) {
  const percentText = signedPct(percent)
  return `${signedUsd(value)}${percentText ? ` (${percentText})` : ''}`
}

function MockFidelity() {
  const trade = readTradeState()
  const portfolio = buildMockFidelityPortfolio(trade, womenLedStocks)
  const hasLocalTrades = trade.orders.length > 0 || trade.donations?.length > 0 || Object.keys(trade.positions).length > 0
  const [savedRows, setSavedRows] = useState([])

  const localRows = portfolio.accounts.flatMap((account) => [
    ...account.positions.map((position) => ({ account: account.type, ...position })),
    {
      account: account.type,
      symbol: 'CASH',
      name: 'Cash',
      type: 'cash',
      value: account.cash,
      allocation: account.value ? (account.cash / account.value) * 100 : 0,
    },
  ])
  const localByKey = new Map(localRows.map((row) => [`${row.account}:${row.symbol}`, row]))
  const rows = savedRows.length && !hasLocalTrades
    ? savedRows.map((row) => {
      const local = localByKey.get(`${row.account_type}:${row.symbol}`)
      return {
        ...local,
        account: row.account_type,
        symbol: row.symbol,
        name: row.name,
        type: row.asset_type,
        value: Number(row.value) || 0,
        allocation: Number(row.allocation_percent) || 0,
        shares: Number(row.quantity) || local?.shares || 0,
        price: Number(row.price) || local?.price || 0,
      }
    })
    : localRows

  const positions = rows.filter((row) => row.type !== 'cash')
  const cashRows = rows.filter((row) => row.type === 'cash')
  const totalCash = cashRows.reduce((sum, row) => sum + row.value, 0)
  const invested = positions.reduce((sum, position) => sum + position.value, 0)
  const totalValue = invested + totalCash
  const accounts = [...new Set(rows.map((row) => row.account))].map((type) => {
    const local = portfolio.accounts.find((account) => account.type === type)
    const cash = cashRows.find((row) => row.account === type)?.value || 0
    return local || {
      type,
      accountNumber: 'Simulation',
      settledCash: cash,
      cashAvailableToTrade: cash,
    }
  })

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

  useEffect(() => {
    getInvestments()
      .then((rows) => (rows.length && !hasLocalTrades ? rows : saveInvestments(portfolio)))
      .then(setSavedRows)
      .catch(() => {})
  }, [])

  return (
    <main className="mock-page">
      <section className="page-shell">
        <div className="page-head split">
          <div>
            <p className="label">Fake brokerage demo</p>
            <h1>Mock Fidelity Account</h1>
            <p>Local demo data only. Changes sync automatically when you are logged in.</p>
          </div>
        </div>

        <div className="metric-grid">
          <div><span>Account holder</span><strong>{portfolio.accountHolder}</strong></div>
          <div><span>Total value</span><strong>{formatUsd(totalValue)}</strong></div>
          <div><span>Cash</span><strong>{formatUsd(totalCash)}</strong></div>
          <div><span>Accounts</span><strong>{accounts.length}</strong></div>
        </div>

        <div className="metric-grid">
          <div>
            <span>Day change</span>
            <strong className={changeClass(portfolio.performance.dayChange)}>
              {formatChange(portfolio.performance.dayChange, portfolio.performance.dayChangePct)}
            </strong>
          </div>
          <div>
            <span>Total gain / loss</span>
            <strong className={changeClass(portfolio.performance.totalGain)}>
              {formatChange(portfolio.performance.totalGain, portfolio.performance.totalGainPct)}
            </strong>
          </div>
          <div><span>Invested</span><strong>{formatUsd(invested)}</strong></div>
          <div><span>Market value vs cash</span><strong>{formatUsd(invested)} / {formatUsd(totalCash)}</strong></div>
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
                    <td>{position.shares || '—'}</td>
                    <td>{formatUsd(position.value)}</td>
                    <td>{formatUsd(position.costBasis)}</td>
                    <td className={changeClass(position.gainLoss)}>
                      {formatChange(position.gainLoss, position.gainLossPct)}
                    </td>
                    <td className={changeClass(position.dayChange)}>
                      {formatChange(position.dayChange, position.dayChangePct)}
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
                <strong>{pct.format(segment.pct)}% · {formatUsd(segment.value)}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Account details<span>Settled cash vs. cash available to trade</span></h2>
          <div className="metric-grid account-details-grid">
            {accounts.map((account) => (
              <div key={account.type} className="account-detail">
                <span>{account.type}</span>
                <strong>{account.accountNumber}</strong>
                <p>Settled cash · {formatUsd(account.settledCash)}</p>
                <p>Available to trade · {formatUsd(account.cashAvailableToTrade)}</p>
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
                {portfolio.recentActivity.map((row) => (
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
