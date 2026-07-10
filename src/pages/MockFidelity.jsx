import { useEffect, useState } from 'react'
import { womenLedStocks } from '../womenLedStocks.js'
import { getInvestments, saveInvestments } from '../../scripts/services/supabaseService.js'
import { buildMockFidelityPortfolio, readTradeState } from '../services/tradePortfolio.js'

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function MockFidelity() {
  const trade = readTradeState()
  const portfolio = buildMockFidelityPortfolio(trade, womenLedStocks)
  const localRows = portfolio.accounts.flatMap((account) => [
    ...account.positions.map(([symbol, name, type, value, allocation, quantity = 0, price = 0]) => ({
      account: account.type,
      symbol,
      name,
      type,
      value,
      allocation,
      quantity,
      price,
    })),
    { account: account.type, symbol: 'CASH', name: 'Cash', type: 'cash', value: account.cash, allocation: 0 },
  ])
  const [savedRows, setSavedRows] = useState([])
  const rows = savedRows.length && !trade.orders.length
    ? savedRows.map((row) => ({
      account: row.account_type,
      symbol: row.symbol,
      name: row.name,
      type: row.asset_type,
      value: Number(row.value),
      allocation: Number(row.allocation_percent),
      quantity: Number(row.quantity) || 0,
      price: Number(row.price) || 0,
    }))
    : localRows
  const positions = rows.filter((row) => row.type !== 'cash')
  const totalCash = rows.filter((row) => row.type === 'cash').reduce((sum, row) => sum + row.value, 0)
  const totalValue = positions.reduce((sum, position) => sum + position.value, totalCash)
  const accountCount = new Set(rows.map((row) => row.account)).size

  useEffect(() => {
    getInvestments()
      .then((rows) => (rows.length && !trade.orders.length ? rows : saveInvestments(portfolio)))
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
          <div><span>Total value</span><strong>{usd.format(totalValue)}</strong></div>
          <div><span>Cash</span><strong>{usd.format(totalCash)}</strong></div>
          <div><span>Accounts</span><strong>{accountCount}</strong></div>
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
