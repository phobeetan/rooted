import { useEffect, useState } from 'react'
import { womenLedStocks } from '../womenLedStocks.js'
import { saveInvestments } from '../../scripts/services/supabaseService.js'
import {
  buildMockFidelityPortfolio,
  freshTradeState,
  readTradeState,
  TRADE_STORAGE_KEY,
} from '../services/tradePortfolio.js'

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const shares = new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 })

function PaperTrading() {
  const [stocks, setStocks] = useState(womenLedStocks.map((stock) => ({ ...stock, price: 0, changePercent: 0 })))
  const [coinbase, setCoinbase] = useState(null)
  const [trade, setTrade] = useState(readTradeState)
  const [selected, setSelected] = useState(womenLedStocks[0].symbol)
  const [side, setSide] = useState('buy')
  const [amount, setAmount] = useState('250')
  const [orderType, setOrderType] = useState('Market')
  const [duration, setDuration] = useState('Day')
  const [review, setReview] = useState(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [syncStatus, setSyncStatus] = useState('')

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
    localStorage.setItem(TRADE_STORAGE_KEY, JSON.stringify(trade))
  }, [trade])

  useEffect(() => {
    setReview(null)
  }, [selected, side, amount, orderType, duration])

  const active = stocks.find((stock) => stock.symbol === selected) || stocks[0]
  const dollars = Number(amount)
  const activeOwned = trade.positions[active?.symbol] || 0
  const estimatedShares = active?.price && dollars > 0 ? dollars / active.price : 0
  const cashAfterOrder = side === 'buy' ? trade.cash - dollars : trade.cash + dollars
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

  async function saveToMockFidelity(nextTrade) {
    try {
      await saveInvestments(buildMockFidelityPortfolio(nextTrade, stocks))
      setSyncStatus('Mock Fidelity updated.')
    } catch (err) {
      setSyncStatus(`Saved in this browser. ${err.message || 'Supabase sync failed.'}`)
    }
  }

  function reviewOrder() {
    if (!active?.price || dollars <= 0) return setError('Enter a trade amount.')
    if (side === 'buy' && dollars > trade.cash) return setError('Not enough cash.')

    if (side === 'sell' && estimatedShares > activeOwned) return setError('Not enough shares to sell.')

    setError('')
    setReview({
      id: Date.now(),
      side,
      symbol: active.symbol,
      name: active.name,
      shares: estimatedShares,
      price: active.price,
      total: dollars,
      orderType,
      duration,
      status: 'Filled',
      time: new Date().toLocaleString(),
    })
  }

  async function confirmOrder() {
    if (!review) return

    const owned = trade.positions[review.symbol] || 0
    const nextShares = owned + (review.side === 'buy' ? review.shares : -review.shares)
    const positions = { ...trade.positions, [review.symbol]: nextShares }
    if (nextShares <= 0.000001) delete positions[review.symbol]

    const nextTrade = {
      cash: trade.cash + (review.side === 'buy' ? -review.total : review.total),
      positions,
      prices: { ...trade.prices, [review.symbol]: review.price },
      orders: [review, ...trade.orders].slice(0, 10),
    }

    setTrade(nextTrade)
    setReview(null)
    setError('')
    await saveToMockFidelity(nextTrade)
  }

  async function resetTrade() {
    const nextTrade = freshTradeState()
    setTrade(nextTrade)
    setReview(null)
    setError('')
    await saveToMockFidelity(nextTrade)
  }

  return (
    <main className="trade-page">
      <section className="page-shell">
        <div className="page-head split">
          <div>
            <p className="label">Trade</p>
            <h1>Trade women-led companies with practice cash.</h1>
            <p>This hackathon simulation uses practice cash. No real brokerage orders are placed.</p>
          </div>
          <button className="btn-outline" type="button" onClick={resetTrade}>Reset</button>
        </div>

        {syncStatus && <p className="note">{syncStatus}</p>}

        <div className="source-note">
          {coinbase?.ok ? 'Coinbase API connected. ' : ''}
          {coinbase?.note || 'Loading market status...'}
        </div>

        <div className="metric-grid">
          <div><span>Portfolio</span><strong>{usd.format(totalValue)}</strong></div>
          <div><span>Fidelity cash</span><strong>{usd.format(trade.cash)}</strong></div>
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
              Action
              <div className="segmented" role="group" aria-label="Trade action">
                <button className={side === 'buy' ? 'active' : ''} type="button" onClick={() => setSide('buy')}>Buy</button>
                <button className={side === 'sell' ? 'active' : ''} type="button" onClick={() => setSide('sell')}>Sell</button>
              </div>
            </label>
            <label className="field">
              Dollar amount
              <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" />
            </label>
            <div className="order-fields">
              <label className="field">
                Order type
                <select value={orderType} onChange={(event) => setOrderType(event.target.value)}>
                  <option>Market</option>
                </select>
              </label>
              <label className="field">
                Time in force
                <select value={duration} onChange={(event) => setDuration(event.target.value)}>
                  <option>Day</option>
                </select>
              </label>
            </div>
            <div className="order-summary">
              <div><span>Estimated shares</span><strong>{estimatedShares ? shares.format(estimatedShares) : '—'}</strong></div>
              <div><span>Owned shares</span><strong>{shares.format(activeOwned)}</strong></div>
              <div><span>Cash after order</span><strong>{Number.isFinite(cashAfterOrder) ? usd.format(cashAfterOrder) : '—'}</strong></div>
            </div>
            <div className="trade-actions">
              <button type="button" onClick={reviewOrder}>Review order</button>
            </div>
            {error && <p className="error-text">{error}</p>}
            {review && (
              <div className="order-review">
                <span className="tag">Review order</span>
                <h3>{review.side.toUpperCase()} {review.symbol}</h3>
                <div className="order-summary compact">
                  <div><span>Quantity</span><strong>{shares.format(review.shares)}</strong></div>
                  <div><span>Estimated price</span><strong>{usd.format(review.price)}</strong></div>
                  <div><span>Estimated total</span><strong>{usd.format(review.total)}</strong></div>
                  <div><span>Order</span><strong>{review.orderType} · {review.duration}</strong></div>
                </div>
                <div className="trade-actions confirm-actions">
                  <button type="button" onClick={confirmOrder}>Submit order</button>
                  <button type="button" onClick={() => setReview(null)}>Edit</button>
                </div>
              </div>
            )}
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
                  <small>{order.status || 'Filled'} · {order.orderType || 'Market'} · {shares.format(order.shares)} @ {usd.format(order.price)} - {order.time}</small>
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
