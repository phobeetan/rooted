import { useState } from 'react'
import { getNegotiationOpener, getNegotiationReply } from '../services/assistantService.js'

const negotiationPrompts = [
  'Can you go above market rate?',
  'Is there room on the signing bonus?',
  'What about the equity grant?',
  'That works for me, I accept.',
]

function SalaryNegotiation() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [started, setStarted] = useState(false)

  async function startPractice() {
    if (loading) return
    setError('')
    setLoading(true)
    setMessages([])
    try {
      const opener = await getNegotiationOpener()
      setMessages([{ role: 'assistant', content: opener }])
      setStarted(true)
    } finally {
      setLoading(false)
    }
  }

  async function sendMessage(text = input) {
    const content = text.trim()
    if (!content || loading) return

    const nextMessages = [...messages, { role: 'user', content }]
    setMessages(nextMessages)
    setInput('')
    setError('')
    setLoading(true)

    try {
      const reply = await getNegotiationReply(nextMessages.slice(-8))
      setMessages([...nextMessages, { role: 'assistant', content: reply }])
    } catch (err) {
      setError(err.message || 'Something went wrong.')
      setMessages([...nextMessages, { role: 'assistant', content: 'I had trouble answering that. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="chat-page">
      <section className="page-shell narrow">
        <div className="page-head">
          <p className="label">Financial education</p>
          <h1>Salary Negotiation Practice</h1>
          <p>Practice negotiating a real job offer with an AI hiring manager, and get coaching feedback after every reply.</p>
        </div>

        {!started ? (
          <div className="prompt-row">
            <button type="button" onClick={startPractice} disabled={loading}>
              {loading ? 'Starting...' : 'Start practice negotiation'}
            </button>
          </div>
        ) : (
          <>
            <div className="prompt-row">
              {negotiationPrompts.map((prompt) => (
                <button type="button" key={prompt} onClick={() => sendMessage(prompt)} disabled={loading}>
                  {prompt}
                </button>
              ))}
            </div>

            <section className="chat-panel" aria-label="Salary negotiation chat">
              <div className="message-list" aria-live="polite">
                {messages.map((message, index) => (
                  <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
                    <span>{message.role === 'user' ? 'You' : 'Hiring Manager'}</span>
                    <p>{message.content}</p>
                  </div>
                ))}
                {loading && (
                  <div className="message assistant">
                    <span>Hiring Manager</span>
                    <p>Thinking...</p>
                  </div>
                )}
              </div>

              <form className="chat-form" onSubmit={(event) => {
                event.preventDefault()
                sendMessage()
              }}>
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Respond to the offer..."
                  disabled={loading}
                />
                <button className="btn-outline" type="submit" disabled={loading}>Send</button>
              </form>
              {error && <p className="error-text">{error}</p>}
            </section>
          </>
        )}
      </section>
    </main>
  )
}

export default SalaryNegotiation
