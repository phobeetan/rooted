import { useState } from 'react'
import { starterPrompts } from '../data/rootedData.js'
import { getAssistantReply } from '../services/assistantService.js'

const ADVISOR_GREETING = {
  role: 'assistant',
  content: 'Hi, I explain investing basics in plain language. I am here for education, not personalized financial advice.',
}

function InvestmentChatbot() {
  const [messages, setMessages] = useState([ADVISOR_GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function sendMessage(text = input) {
    const content = text.trim()
    if (!content || loading) return

    const nextMessages = [...messages, { role: 'user', content }]
    setMessages(nextMessages)
    setInput('')
    setError('')
    setLoading(true)

    try {
      const reply = await getAssistantReply(nextMessages.slice(-8))
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
          <h1>AI Investment Assistant</h1>
          <p>Ask questions using your saved profile and Mock Fidelity investments as context.</p>
        </div>

        <div className="prompt-row">
          {starterPrompts.map((prompt) => (
            <button type="button" key={prompt} onClick={() => sendMessage(prompt)} disabled={loading}>
              {prompt}
            </button>
          ))}
        </div>

        <section className="chat-panel" aria-label="Investment assistant chat">
          <div className="message-list" aria-live="polite">
            {messages.map((message, index) => (
              <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
                <span>{message.role === 'user' ? 'You' : 'Rooted AI'}</span>
                <p>{message.content}</p>
              </div>
            ))}
            {loading && (
              <div className="message assistant">
                <span>Rooted AI</span>
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
              placeholder="Ask an investment question"
              disabled={loading}
            />
            <button className="btn-outline" type="submit" disabled={loading}>Send</button>
          </form>
          {error && <p className="error-text">{error}</p>}
        </section>
      </section>
    </main>
  )
}

export default InvestmentChatbot
