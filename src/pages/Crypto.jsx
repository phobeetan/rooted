import { useEffect, useMemo, useState } from 'react'
import { saveInvestments } from '../../scripts/services/supabaseService.js'
import { buildMockFidelityPortfolio, readTradeState, TRADE_STORAGE_KEY } from '../services/tradePortfolio.js'

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const units = new Intl.NumberFormat('en-US', { maximumFractionDigits: 8 })

function Crypto() {
  const [assets, setAssets] = useState([])
  const [source, setSource] = useState('Coinbase public spot price API')
  const [asOf, setAsOf] = useState('')
  const [trade, setTrade] = useState(readTradeState)
  const [selected, setSelected] = useState('BTC')
  const [side, setSide] = useState('buy')
  const [amount, setAmount] = useState('100')
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [syncStatus, setSyncStatus] = useState('')

  useEffect(() => {
    fetch('/api/crypto')
      .then((response) => response.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setAssets((data.assets || []).map((asset) => ({ ...asset, type: 'crypto' })))
        setSource(data.source || 'Coinbase public spot price API')
        setAsOf(data.asOf || '')
      })
      .catch((err) => setError(err.message || 'Crypto prices failed.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    localStorage.setItem(TRADE_STORAGE_KEY, JSON.stringify(trade))
  }, [trade])

  useEffect(() => {
    setReview(null)
  }, [selected, side, amount])

  const active = assets.find((asset) => asset.symbol === selected) || assets[0]
  const dollars = Number(amount)
  const activeOwned = trade.positions[active?.symbol] || 0
  const estimatedUnits = active?.price && dollars > 0 ? dollars / active.price : 0
  const cashAfterOrder = side === 'buy' ? trade.cash - dollars : trade.cash + dollars
  const assetSymbols = new Set(assets.map((asset) => asset.symbol))

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return assets
    return assets.filter((asset) => (
      asset.symbol.toLowerCase().includes(q)
      || asset.name.toLowerCase().includes(q)
      || asset.lane.toLowerCase().includes(q)
    ))
  }, [assets, query])

  const holdings = Object.entries(trade.positions)
    .filter(([symbol]) => assetSymbols.has(symbol) || trade.orders.some((order) => order.symbol === symbol && order.assetType === 'crypto'))
    .map(([symbol, count]) => {
      const asset = assets.find((item) => item.symbol === symbol)
      const order = trade.orders.find((item) => item.symbol === symbol)
      const price = asset?.price || trade.prices[symbol] || order?.price || 0
      return { symbol, name: asset?.name || order?.name || symbol, units: count, price, value: count * price }
    })
  const holdingsValue = holdings.reduce((sum, item) => sum + item.value, 0)
  const cryptoAssets = assets.map((asset) => ({ ...asset, type: 'crypto' }))

  async function saveToMockFidelity(nextTrade) {
    try {
      await saveInvestments(buildMockFidelityPortfolio(nextTrade, cryptoAssets))
      setSyncStatus('Mock Fidelity updated.')
    } catch (err) {
      setSyncStatus(`Saved in this browser. ${err.message || 'Supabase sync failed.'}`)
    }
  }

  function reviewOrder() {
    if (!active?.price || !Number.isFinite(dollars) || dollars <= 0) return setError('Enter a trade amount.')
    if (side === 'buy' && dollars > trade.cash) return setError('Not enough cash.')
    if (side === 'sell' && estimatedUnits > activeOwned) return setError('Not enough crypto to sell.')

    setError('')
    setReview({
      id: Date.now(),
      side,
      symbol: active.symbol,
      name: active.name,
      assetType: 'crypto',
      shares: estimatedUnits,
      price: active.price,
      total: dollars,
      orderType: 'Market',
      duration: 'Day',
      status: 'Filled',
      time: new Date().toLocaleString(),
    })
  }

  async function confirmOrder() {
    if (!review) return

    const owned = trade.positions[review.symbol] || 0
    const nextUnits = owned + (review.side === 'buy' ? review.shares : -review.shares)
    const positions = { ...trade.positions, [review.symbol]: nextUnits }
    if (nextUnits <= 0.00000001) delete positions[review.symbol]

    const nextTrade = {
      ...trade,
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

  return (
    <main className="crypto-page">
      <section className="page-shell">
        <div className="page-head split">
          <div>
            <p className="label">Crypto</p>
            <h1>Trade crypto with practice cash.</h1>
            <p>This simulation uses Coinbase spot prices. No real crypto wallet or exchange orders are created.</p>
          </div>
          <a
            className="btn-outline"
            href="/investment-chatbot?prompt=Explain%20how%20a%20beginner%20should%20think%20about%20crypto%20risk%20and%20portfolio%20size."
          >
            Ask Bud
          </a>
        </div>

        {syncStatus && <p className="note">{syncStatus}</p>}

        <div className="source-note">
          {source}{asOf ? ` - updated ${new Date(asOf).toLocaleTimeString()}` : ''}
        </div>

        <div className="metric-grid">
          <div><span>Crypto value</span><strong>{usd.format(holdingsValue)}</strong></div>
          <div><span>Practice cash</span><strong>{usd.format(trade.cash)}</strong></div>
          <div><span>Holdings</span><strong>{holdings.length}</strong></div>
          <div><span>Assets</span><strong>{assets.length}</strong></div>
        </div>

        <section className="trade-layout">
          <div className="panel">
            <span className="tag">{active?.lane || 'Crypto asset'}</span>
            <h2>{active?.symbol || 'Crypto'} <span>{active?.name || 'Loading'}</span></h2>
            <div className="price-line">
              <strong>{active?.price ? usd.format(active.price) : 'Loading'}</strong>
              <span>{active?.pair || 'USD spot'}</span>
            </div>
            <label className="field">
              Action
              <div className="segmented" role="group" aria-label="Crypto trade action">
                <button className={side === 'buy' ? 'active' : ''} type="button" onClick={() => setSide('buy')}>Buy</button>
                <button className={side === 'sell' ? 'active' : ''} type="button" onClick={() => setSide('sell')}>Sell</button>
              </div>
            </label>
            <label className="field">
              Dollar amount
              <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" />
            </label>
            <div className="order-summary">
              <div><span>Estimated units</span><strong>{estimatedUnits ? units.format(estimatedUnits) : '-'}</strong></div>
              <div><span>Owned units</span><strong>{units.format(activeOwned)}</strong></div>
              <div><span>Cash after order</span><strong>{Number.isFinite(cashAfterOrder) ? usd.format(cashAfterOrder) : '-'}</strong></div>
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
                  <div><span>Quantity</span><strong>{units.format(review.shares)}</strong></div>
                  <div><span>Price</span><strong>{usd.format(review.price)}</strong></div>
                  <div><span>Total</span><strong>{usd.format(review.total)}</strong></div>
                  <div><span>Order</span><strong>Market - Day</strong></div>
                </div>
                <div className="trade-actions confirm-actions">
                  <button type="button" onClick={confirmOrder}>Submit order</button>
                  <button type="button" onClick={() => setReview(null)}>Edit</button>
                </div>
              </div>
            )}
          </div>

          <div className="panel">
            <h2>Crypto portfolio</h2>
            {holdings.length ? (
              <div className="mini-list">
                {holdings.map((item) => (
                  <div key={item.symbol}>
                    <span>{item.symbol}</span>
                    <strong>{usd.format(item.value)}</strong>
                    <small>{units.format(item.units)} units @ {usd.format(item.price)}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty">No crypto positions yet.</p>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="table-head">
            <h2>Crypto assets</h2>
            <label className="search-row compact">
              <span>Search</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="BTC, Ethereum, smart contracts" />
            </label>
          </div>

          <div className="crypto-grid">
            {filtered.map((asset) => (
              <button
                className={`crypto-card ${asset.symbol === active?.symbol ? 'active' : ''}`}
                key={asset.symbol}
                type="button"
                onClick={() => setSelected(asset.symbol)}
              >
                <span className="tag">{asset.lane}</span>
                <h2>{asset.symbol}<span>{asset.name}</span></h2>
                <strong>{asset.price ? usd.format(asset.price) : '...'}</strong>
                <p>{asset.pair} spot price from Coinbase.</p>
              </button>
            ))}
          </div>
          {loading && <p className="empty">Loading Coinbase prices...</p>}
          {!loading && !filtered.length && <p className="empty">No crypto assets found.</p>}
        </section>

        <section className="panel">
          <h2>Recent crypto orders</h2>
          {trade.orders.filter((order) => order.assetType === 'crypto').length ? (
            <div className="mini-list">
              {trade.orders.filter((order) => order.assetType === 'crypto').map((order) => (
                <div key={order.id}>
                  <span>{order.side.toUpperCase()} {order.symbol}</span>
                  <strong>{usd.format(order.total)}</strong>
                  <small>{order.status || 'Filled'} - {units.format(order.shares)} @ {usd.format(order.price)} - {order.time}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty">No crypto orders yet.</p>
          )}
        </section>
      </section>
    </main>
  )
}

export default Crypto
