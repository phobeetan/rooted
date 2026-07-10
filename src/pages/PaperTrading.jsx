import { useEffect, useState } from 'react'
import { womenLedStocks } from '../womenLedStocks.js'

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const shares = new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 })
const tradeKey = 'rooted-trade-portfolio'

function freshTradeState() {
  return { cash: 10000, positions: {}, orders: [] }
}

function readTradeState() {
  try {
    return JSON.parse(localStorage.getItem(tradeKey)) || freshTradeState()
  } catch {
    return freshTradeState()
  }
}

function PaperTrading() {
  const [stocks, setStocks] = useState(womenLedStocks.map((stock) => ({ ...stock, price: 0, changePercent: 0 })))
  const [coinbase, setCoinbase] = useState(null)
  const [trade, setTrade] = useState(readTradeState)
  const [selected, setSelected] = useState(womenLedStocks[0].symbol)
  const [amount, setAmount] = useState('250')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/stocks')
      .then((response) => response.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setStocks(data.stocks)
        setCoinbase(data.coinbase)
      })
      .catch((err) => setError(err.message || 'Stock data failed.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    localStorage.setItem(tradeKey, JSON.stringify(trade))
  }, [trade])

  const active = stocks.find((stock) => stock.symbol === selected) || stocks[0]
  const q = query.toLowerCase()
  const filtered = stocks.filter((stock) => (
    stock.symbol.toLowerCase().includes(q)
    || stock.name.toLowerCase().includes(q)
    || stock.leader.toLowerCase().includes(q)
  ))
  const holdings = Object.entries(trade.positions)
    .map(([symbol, count]) => {
      const stock = stocks.find((item) => item.symbol === symbol)
      return stock ? { ...stock, shares: count, value: count * stock.price } : null
    })
    .filter(Boolean)
  const holdingsValue = holdings.reduce((sum, item) => sum + item.value, 0)
  const totalValue = trade.cash + holdingsValue

  function placeOrder(side) {
    const dollars = Number(amount)
    if (!active?.price || dollars <= 0) return setError('Enter a trade amount.')
    if (side === 'buy' && dollars > trade.cash) return setError('Not enough cash.')

    const owned = trade.positions[active.symbol] || 0
    const tradeShares = dollars / active.price
    if (side === 'sell' && tradeShares > owned) return setError('Not enough shares to sell.')

    setTrade((current) => {
      const nextShares = (current.positions[active.symbol] || 0) + (side === 'buy' ? tradeShares : -tradeShares)
      const positions = { ...current.positions, [active.symbol]: nextShares }
      if (nextShares <= 0.000001) delete positions[active.symbol]

      return {
        cash: current.cash + (side === 'buy' ? -dollars : dollars),
        positions,
        orders: [{
          id: Date.now(),
          side,
          symbol: active.symbol,
          shares: tradeShares,
          price: active.price,
          total: dollars,
          time: new Date().toLocaleString(),
        }, ...current.orders].slice(0, 10),
      }
    })
    setError('')
  }

  return (
    <main className="trade-page">
      <section className="page-shell">
        <div className="page-head split">
          <div>
            <p className="label">Trade</p>
            <h1>Trade women-led companies with practice cash.</h1>
            <p>Start with $10,000, buy fractional shares, and learn how positions move without placing real orders.</p>
          </div>
          <button className="btn-outline" type="button" onClick={() => setTrade(freshTradeState())}>Reset</button>
        </div>

        <div className="source-note">
          {coinbase?.ok ? 'Coinbase API connected. ' : ''}
          {coinbase?.note || 'Loading market status...'}
        </div>

        <div className="metric-grid">
          <div><span>Portfolio</span><strong>{usd.format(totalValue)}</strong></div>
          <div><span>Cash</span><strong>{usd.format(trade.cash)}</strong></div>
          <div><span>Holdings</span><strong>{usd.format(holdingsValue)}</strong></div>
          <div><span>Stocks</span><strong>{stocks.length}</strong></div>
        </div>

        <section className="trade-layout">
          <div className="panel">
            <span className="tag">{active?.sector}</span>
            <h2>{active?.symbol} <span>{active?.name}</span></h2>
            <p>Led by {active?.leader}</p>
            <div className="price-line">
              <strong>{active?.price ? usd.format(active.price) : 'Loading'}</strong>
              <span className={active?.changePercent >= 0 ? 'up' : 'down'}>
                {active?.changePercent >= 0 ? '+' : ''}{active?.changePercent || 0}%
              </span>
            </div>
            <label className="field">
              Amount
              <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" />
            </label>
            <div className="trade-actions">
              <button type="button" onClick={() => placeOrder('buy')}>Buy</button>
              <button type="button" onClick={() => placeOrder('sell')}>Sell</button>
            </div>
            {error && <p className="error-text">{error}</p>}
          </div>

          <div className="panel">
            <h2>Portfolio</h2>
            {holdings.length ? (
              <div className="mini-list">
                {holdings.map((item) => (
                  <div key={item.symbol}>
                    <span>{item.symbol}</span>
                    <strong>{usd.format(item.value)}</strong>
                    <small>{shares.format(item.shares)} shares</small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty">No positions yet.</p>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="table-head">
            <h2>Top 50 women-led stocks</h2>
            <label className="search-row compact">
              <span>Search</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Stock, company, or CEO" />
            </label>
          </div>
          <div className="stock-table">
            <div className="stock-row header">
              <span>Symbol</span><span>Company</span><span>Leader</span><span>Price</span><span />
            </div>
            {filtered.map((stock) => (
              <button className={`stock-row ${stock.symbol === active?.symbol ? 'active' : ''}`} key={stock.symbol} type="button" onClick={() => setSelected(stock.symbol)}>
                <span>{stock.symbol}</span>
                <span>{stock.name}</span>
                <span>{stock.leader}</span>
                <span>{stock.price ? usd.format(stock.price) : '...'}</span>
                <span className={stock.changePercent >= 0 ? 'up' : 'down'}>
                  {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent || 0}%
                </span>
              </button>
            ))}
          </div>
          {loading && <p className="empty">Loading quotes...</p>}
        </section>

        <section className="panel">
          <h2>Recent orders</h2>
          {trade.orders.length ? (
            <div className="mini-list">
              {trade.orders.map((order) => (
                <div key={order.id}>
                  <span>{order.side.toUpperCase()} {order.symbol}</span>
                  <strong>{usd.format(order.total)}</strong>
                  <small>{shares.format(order.shares)} @ {usd.format(order.price)} - {order.time}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty">No orders yet.</p>
          )}
        </section>
      </section>
    </main>
  )
}

export default PaperTrading
