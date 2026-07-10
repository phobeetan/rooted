import { useEffect, useMemo, useState } from 'react'

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function Crypto() {
  const [assets, setAssets] = useState([])
  const [source, setSource] = useState('Coinbase public spot price API')
  const [asOf, setAsOf] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch('/api/crypto')
      .then((response) => response.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setAssets(data.assets || [])
        setSource(data.source || source)
        setAsOf(data.asOf || '')
      })
      .catch((err) => setError(err.message || 'Crypto prices failed.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return assets
    return assets.filter((asset) => (
      asset.symbol.toLowerCase().includes(q)
      || asset.name.toLowerCase().includes(q)
      || asset.lane.toLowerCase().includes(q)
    ))
  }, [assets, query])

  return (
    <main className="crypto-page">
      <section className="page-shell">
        <div className="page-head split">
          <div>
            <p className="label">Crypto</p>
            <h1>Track crypto prices from Coinbase.</h1>
            <p>Public spot prices for crypto assets beginners commonly ask about. This is market data, not a real crypto wallet.</p>
          </div>
          <a
            className="btn-outline"
            href="/investment-chatbot?prompt=Explain%20how%20a%20beginner%20should%20think%20about%20crypto%20risk%20and%20portfolio%20size."
          >
            Ask Bud
          </a>
        </div>

        <div className="source-note">
          {source}{asOf ? ` - updated ${new Date(asOf).toLocaleTimeString()}` : ''}
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="metric-grid">
          <div><span>Assets</span><strong>{assets.length}</strong></div>
          <div><span>Base currency</span><strong>USD</strong></div>
          <div><span>Source</span><strong>Coinbase</strong></div>
          <div><span>Mode</span><strong>Watchlist</strong></div>
        </div>

        <section className="panel">
          <div className="table-head">
            <h2>Crypto watchlist</h2>
            <label className="search-row compact">
              <span>Search</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="BTC, Ethereum, smart contracts" />
            </label>
          </div>

          <div className="crypto-grid">
            {filtered.map((asset) => (
              <article className="crypto-card" key={asset.symbol}>
                <span className="tag">{asset.lane}</span>
                <h2>{asset.symbol}<span>{asset.name}</span></h2>
                <strong>{asset.price ? usd.format(asset.price) : '...'}</strong>
                <p>{asset.pair} spot price from Coinbase.</p>
              </article>
            ))}
          </div>
          {loading && <p className="empty">Loading Coinbase prices...</p>}
          {!loading && !filtered.length && <p className="empty">No crypto assets found.</p>}
        </section>
      </section>
    </main>
  )
}

export default Crypto
