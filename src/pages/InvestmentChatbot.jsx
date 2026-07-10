import { useEffect, useRef, useState } from 'react'
import { starterPrompts } from '../data/rootedData.js'
import { getAssistantReply } from '../services/assistantService.js'

const ADVISOR_GREETING = {
  role: 'assistant',
  content: 'Hi, I\'m Bud. I can explain investing basics and help you understand your Rooted portfolio in plain language.',
}

function InvestmentChatbot({ isOpen, initialPrompt = '', onClose, onOpen }) {
  const [messages, setMessages] = useState([ADVISOR_GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const messageList = useRef(null)
  const sentInitialPrompt = useRef(false)

  useEffect(() => {
    messageList.current?.scrollTo({ top: messageList.current.scrollHeight })
  }, [isOpen, messages, loading])

  useEffect(() => {
    if (!isOpen || !initialPrompt || sentInitialPrompt.current) return
    sentInitialPrompt.current = true
    sendMessage(initialPrompt)
  }, [isOpen, initialPrompt])

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
    <>
      <button
        className={`bud-launcher ${isOpen ? 'hidden' : ''}`}
        type="button"
        onClick={onOpen}
        aria-label="Open Bud"
        aria-hidden={isOpen}
        tabIndex={isOpen ? -1 : undefined}
      >
        <span className="bud-avatar" aria-hidden="true">B</span>
        <span>Bud</span>
      </button>

      <aside
        className={`bud-panel ${isOpen ? 'open' : ''}`}
        aria-label="Bud, AI investment assistant"
        aria-hidden={!isOpen}
        inert={!isOpen ? '' : undefined}
      >
        <header className="bud-header">
          <div className="bud-identity">
            <span className="bud-avatar" aria-hidden="true">B</span>
            <div>
              <h2>Bud</h2>
              <p><span aria-hidden="true" /> AI investment assistant</p>
            </div>
          </div>
          <button className="bud-hide" type="button" onClick={onClose} aria-label="Hide Bud">
            Hide
            <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" width="16">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </button>
        </header>

        <section className="bud-suggestions" aria-label="Suggested questions">
          <p>Try asking</p>
          <div className="bud-prompt-row">
            {starterPrompts.map((prompt) => (
              <button type="button" key={prompt} onClick={() => sendMessage(prompt)} disabled={loading}>
                {prompt}
              </button>
            ))}
          </div>
        </section>

        <div className="bud-message-list" ref={messageList} aria-live="polite">
          {messages.map((message, index) => (
            <div className={`bud-message ${message.role}`} key={`${message.role}-${index}`}>
              <span>{message.role === 'user' ? 'You' : 'Bud'}</span>
              <p>{message.content}</p>
            </div>
          ))}
          {loading && (
            <div className="bud-message assistant">
              <span>Bud</span>
              <p>Thinking...</p>
            </div>
          )}
        </div>

        {error && <p className="bud-error" role="alert">{error}</p>}
        <form className="bud-form" onSubmit={(event) => {
          event.preventDefault()
          sendMessage()
        }}>
          <input
            aria-label="Message Bud"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Message Bud"
            disabled={loading}
          />
          <button type="submit" disabled={loading}>Send</button>
        </form>
        <p className="bud-disclaimer">Educational guidance, not personalized financial advice.</p>
      </aside>
    </>
  )
}

export default InvestmentChatbot
