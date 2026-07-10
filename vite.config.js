import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { womenLedStocks } from './src/womenLedStocks.js'

const page = (path) => fileURLToPath(new URL(path, import.meta.url))

const systemPrompt = `You are Rooted's AI Investment Assistant. You help users understand investing in simple, beginner-friendly language. Focus on financial education, long-term thinking, risk awareness, diversification, and confidence-building.

You are not a licensed financial advisor. Do not tell users exactly what stock to buy or sell. Do not guarantee returns. When users ask for specific investment decisions, explain the tradeoffs, risks, and general principles instead.

Rooted is designed especially for early-career women building financial confidence, independence, and smart money habits. Make answers practical, supportive, and easy to understand.`

const mockPortfolioContext = {
  totalPortfolioValue: 42850.75,
  cashBalance: 2350.25,
  positions: [
    { ticker: 'AAPL', allocationPercent: 6.12 },
    { ticker: 'VOO', allocationPercent: 28.4 },
    { ticker: 'VTI', allocationPercent: 22.8 },
    { ticker: 'QQQ', allocationPercent: 12.1 },
  ],
}

let stockCache = null
let coinbaseCache = null
let lastMockFidelityImport = null

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function num(value) {
  return Number(String(value || '').replace(/[$,%+,]/g, '')) || 0
}

function fallbackQuote(stock) {
  const seed = stock.symbol.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const day = Math.floor(Date.now() / 86400000)
  const changePercent = Number((Math.sin((day + seed) / 5) * 2.8).toFixed(2))
  const price = Number((35 + (seed % 360) + changePercent).toFixed(2))
  const change = Number(((price * changePercent) / 100).toFixed(2))

  return {
    ...stock,
    price,
    change,
    changePercent,
    asOf: new Date().toISOString(),
    source: 'demo',
  }
}

async function nasdaqQuote(stock) {
  const response = await fetch(`https://api.nasdaq.com/api/quote/${stock.symbol}/info?assetclass=stocks`, {
    headers: {
      Accept: 'application/json, text/plain, */*',
      'User-Agent': 'Mozilla/5.0',
    },
  })
  const data = await response.json()
  if (!response.ok || !data.data?.primaryData) throw new Error('Quote unavailable.')

  const primary = data.data.primaryData
  const price = num(primary.lastSalePrice)
  if (!price) throw new Error('Quote unavailable.')

  return {
    ...stock,
    price,
    change: num(primary.netChange),
    changePercent: num(primary.percentageChange),
    asOf: primary.lastTradeTimestamp || new Date().toISOString(),
    source: 'nasdaq',
  }
}

async function coinbaseStatus() {
  if (coinbaseCache && Date.now() - coinbaseCache.time < 120000) return coinbaseCache.value

  try {
    const response = await fetch('https://api.coinbase.com/api/v3/brokerage/market/products?limit=1')
    const data = await response.json()
    coinbaseCache = {
      time: Date.now(),
      value: {
        ok: response.ok,
        product: data.products?.[0]?.product_id || null,
        note: 'Coinbase public market API is connected for crypto products; stock quotes use the equities feed.',
      },
    }
  } catch (error) {
    coinbaseCache = {
      time: Date.now(),
      value: { ok: false, product: null, note: error.message || 'Coinbase check failed.' },
    }
  }

  return coinbaseCache.value
}

async function stockData() {
  if (stockCache && Date.now() - stockCache.time < 60000) return stockCache.value

  const quotes = await Promise.all(
    womenLedStocks.map((stock) => nasdaqQuote(stock).catch(() => fallbackQuote(stock))),
  )
  const value = {
    stocks: quotes,
    coinbase: await coinbaseStatus(),
  }
  stockCache = { time: Date.now(), value }
  return value
}

function cleanMessages(messages) {
  if (!Array.isArray(messages)) return []
  return messages
    .filter((message) => ['user', 'assistant'].includes(message.role) && typeof message.content === 'string')
    .map((message) => ({ role: message.role, content: message.content.slice(0, 1600) }))
    .slice(-10)
}

function mockReply(messages) {
  const question = [...messages].reverse().find((message) => message.role === 'user')?.content.toLowerCase() || ''

  if (question.includes('buy') || question.includes('sell') || question.includes('which stock')) {
    return 'I cannot tell you exactly what to buy or sell. A useful way to think about a decision is to compare fees, diversification, risk, time horizon, and whether the investment fits your budget after emergency savings and high-interest debt are handled.'
  }

  if (question.includes('portfolio') || question.includes('allocation') || question.includes('concentrated')) {
    return `This mock portfolio is worth about $${mockPortfolioContext.totalPortfolioValue.toLocaleString()} with about $${mockPortfolioContext.cashBalance.toLocaleString()} in cash. The largest sample holding is VOO at ${mockPortfolioContext.positions[1].allocationPercent}%, which usually means a broad U.S. stock-market fund is doing a lot of the work. Concentration risk rises when one company or sector becomes a large share, so compare each holding against your goals and risk tolerance.`
  }

  if (question.includes('etf')) {
    return 'An ETF, or exchange-traded fund, is a basket of investments that trades like a stock. Many ETFs hold hundreds of companies, which can make diversification easier for beginners. The main things to compare are what it owns, fees, risk level, and whether it matches your long-term plan.'
  }

  if (question.includes('index fund') || question.includes('stocks')) {
    return 'A stock is ownership in one company. An index fund owns many investments that follow a market index, such as the S&P 500. Individual stocks can move a lot based on one company, while index funds spread risk across many companies.'
  }

  if (question.includes('beginner') || question.includes('start')) {
    return 'A beginner-friendly path is to build a small emergency fund, pay attention to high-interest debt, learn the basics of risk, and start with diversified funds before picking individual stocks. The goal is confidence and consistency, not perfect timing.'
  }

  if (question.includes('risk')) {
    return 'Investment risk is the chance your money can lose value or not grow as expected. Beginners can manage risk by diversifying, keeping cash for short-term needs, investing for the long term, and avoiding bets that would hurt too much if they went wrong.'
  }

  if (question.includes('saving') || question.includes('budget')) {
    return 'Saving is usually for money you may need soon, emergencies, or specific short-term goals. Investing is for longer-term goals where you can accept market ups and downs. A simple rule is to protect your basics first, then invest money that has time to grow.'
  }

  return 'Think of investing as a long-term habit: spend less than you earn when possible, keep an emergency cushion, diversify, understand risk, and avoid decisions based on hype. I can explain any investing term or compare general tradeoffs.'
}

function extractText(data) {
  if (data.output_text) return data.output_text
  return (data.output || [])
    .flatMap((item) => item.content || [])
    .map((part) => part.text || '')
    .filter(Boolean)
    .join('\n')
    .trim()
}

async function openAiReply(messages) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-5.6',
      reasoning: { effort: 'low' },
      instructions: `${systemPrompt}\n\nMock portfolio context for demo only:\n${JSON.stringify(mockPortfolioContext, null, 2)}`,
      input: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error?.message || 'OpenAI request failed.')
  return extractText(data) || mockReply(messages)
}

function investmentChatApi(req, res, next) {
  const url = new URL(req.url, 'http://localhost')
  if (url.pathname !== '/api/investment-chat') return next()
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Use POST.' })

  readJson(req)
    .then(async (body) => {
      const messages = cleanMessages(body.messages)
      if (!messages.some((message) => message.role === 'user')) {
        return sendJson(res, 400, { error: 'Send at least one user message.' })
      }

      const reply = process.env.OPENAI_API_KEY ? await openAiReply(messages) : mockReply(messages)
      return sendJson(res, 200, { reply })
    })
    .catch((error) => sendJson(res, 500, { error: error.message || 'Chat failed.' }))
}

function stocksApi(req, res, next) {
  const url = new URL(req.url, 'http://localhost')
  if (url.pathname !== '/api/stocks') return next()
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Use GET.' })

  stockData()
    .then((data) => sendJson(res, 200, data))
    .catch((error) => sendJson(res, 500, { error: error.message || 'Stock data failed.' }))
}

function mockFidelityApi(req, res, next) {
  const url = new URL(req.url, 'http://localhost')
  if (url.pathname !== '/api/mock-fidelity/import') return next()

  if (req.method === 'GET') {
    if (!lastMockFidelityImport) return sendJson(res, 404, { message: 'No mock Fidelity data received yet.' })
    return sendJson(res, 200, { data: lastMockFidelityImport })
  }

  if (req.method !== 'POST') return sendJson(res, 405, { message: 'Use GET or POST.' })

  readJson(req)
    .then((payload) => {
      if (payload.provider !== 'mock_fidelity' || !Array.isArray(payload.accounts)) {
        return sendJson(res, 400, { message: 'Invalid mock Fidelity payload.' })
      }
      lastMockFidelityImport = payload
      return sendJson(res, 200, { message: 'Mock Fidelity data received.' })
    })
    .catch(() => sendJson(res, 400, { message: 'Invalid JSON payload.' }))
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'investment-chat-api',
      configureServer(server) {
        server.middlewares.use(stocksApi)
        server.middlewares.use(investmentChatApi)
        server.middlewares.use(mockFidelityApi)
      },
      configurePreviewServer(server) {
        server.middlewares.use(stocksApi)
        server.middlewares.use(investmentChatApi)
        server.middlewares.use(mockFidelityApi)
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        main: page('./index.html'),
        login: page('./login.html'),
        onboarding: page('./onboarding.html'),
        dashboard: page('./dashboard.html'),
      },
      external: (id) => id.startsWith('https://'),
    },
  },
})
