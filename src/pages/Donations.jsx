import { useState } from 'react'
import { createPortal } from 'react-dom'
import { donations } from '../data/rootedData.js'
import { readTradeState, TRADE_STORAGE_KEY } from '../services/tradePortfolio.js'

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function Donations() {
  const [trade, setTrade] = useState(readTradeState)
  const [selected, setSelected] = useState(null)
  const [amount, setAmount] = useState('50')
  const [message, setMessage] = useState('')

  const availableCash = Number(trade.cash) || 0
  const gifts = trade.donations || []
  const totalGiven = gifts.reduce((sum, gift) => sum + gift.amount, 0)
  const dollars = Number(amount)
  const cashAfter = availableCash - (Number.isFinite(dollars) ? dollars : 0)

  function openDonation(donation) {
    setSelected(donation)
    setAmount('50')
    setMessage('')
  }

  function giveMoney() {
    if (!selected) return
    if (!Number.isFinite(dollars) || dollars <= 0) return setMessage('Enter a donation amount.')
    if (dollars > availableCash) return setMessage('Not enough mock Fidelity cash.')

    const nextTrade = {
      ...trade,
      cash: availableCash - dollars,
      donations: [
        {
          id: Date.now(),
          name: selected.name,
          amount: dollars,
          contact: selected.contact,
          time: new Date().toLocaleString(),
        },
        ...gifts,
      ].slice(0, 25),
    }

    localStorage.setItem(TRADE_STORAGE_KEY, JSON.stringify(nextTrade))
    setTrade(nextTrade)
    setMessage(`${usd.format(dollars)} sent from mock Fidelity cash.`)
  }

  return (
    <>
      <main className="donations-page">
        <section className="page-shell">
          <div className="page-head split">
            <div>
              <p className="label">Mock giving</p>
              <h1>Women-focused donations</h1>
              <p>Choose a fund and give from your mock Fidelity cash. No real money moves.</p>
            </div>
          </div>

          <div className="metric-grid">
            <div><span>Available cash</span><strong>{usd.format(availableCash)}</strong></div>
            <div><span>Total mock donated</span><strong>{usd.format(totalGiven)}</strong></div>
            <div><span>Donation listings</span><strong>{donations.length}</strong></div>
            <div><span>Last gift</span><strong>{gifts[0] ? usd.format(gifts[0].amount) : '—'}</strong></div>
          </div>

          <section className="donation-list" aria-label="Women-focused donation listings">
            {donations.map((donation) => (
              <button className="donation-card" type="button" key={donation.name} onClick={() => openDonation(donation)}>
                <div className="startup-card-head">
                  <div>
                    <h2>{donation.name}</h2>
                    <p>{donation.one}</p>
                  </div>
                  <span>{donation.category}</span>
                </div>
                <div className="startup-tags">
                  <strong>Goal {usd.format(donation.goal)}</strong>
                  <div><span>{donation.contact}</span></div>
                </div>
              </button>
            ))}
          </section>
        </section>
      </main>

      {selected && createPortal(
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="donation-title" onClick={(event) => event.stopPropagation()}>
            <button className="close" type="button" aria-label="Close popup" onClick={() => setSelected(null)}>x</button>
            <span className="tag">{selected.category}</span>
            <h2 id="donation-title">{selected.name}</h2>
            <p>{selected.detail}</p>

            <div className="modal-cols donation-modal-cols">
              <div>
                <h3>Admins</h3>
                <ul className="plain-list">
                  {selected.admins.map((admin) => <li key={admin}>{admin}</li>)}
                </ul>
              </div>
              <div>
                <h3>Contact</h3>
                <p>{selected.contact}</p>
              </div>
            </div>

            <div className="stage-box muted">
              <div className="stage-line">
                <span>Donation goal</span>
                <strong>{usd.format(selected.goal)}</strong>
              </div>
              <label className="field donation-amount">
                Amount
                <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" />
              </label>
              <div className="prompt-row donation-presets">
                {[25, 50, 100, 250].map((value) => (
                  <button type="button" key={value} onClick={() => setAmount(String(value))}>{usd.format(value)}</button>
                ))}
              </div>
              <div className="order-summary compact">
                <div><span>Cash now</span><strong>{usd.format(availableCash)}</strong></div>
                <div><span>Cash after gift</span><strong>{Number.isFinite(cashAfter) ? usd.format(cashAfter) : '—'}</strong></div>
              </div>
              <div className="trade-actions">
                <button type="button" onClick={giveMoney}>Give money</button>
              </div>
              {message && <p className={message.includes('sent') ? 'note' : 'error-text'}>{message}</p>}
            </div>
          </section>
        </div>,
        document.body,
      )}
    </>
  )
}

export default Donations
