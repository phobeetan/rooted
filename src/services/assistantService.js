import { mockCareerProfile, mockFidelity, startups } from '../data/rootedData.js'
import { forumPosts } from '../data/forumPosts.js'
import { womenLedStocks } from '../womenLedStocks.js'

// Set VITE_GEMINI_API_KEY in a .env.local file (gitignored) to enable real
// Gemini replies. Without it, getAssistantReply falls back to the rule-based
// local reply so the demo still works offline or if the call fails.
const GEMINI_API_KEY = import.meta.env?.VITE_GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-3.5-flash'
const PAPER_TRADING_KEY = 'rooted-paper-portfolio'

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function buildPortfolioSummary() {
  const positions = mockFidelity.accounts.flatMap((account) =>
    account.positions.map(([symbol, name, type, value, allocation]) => ({
      account: account.type,
      symbol,
      name,
      type,
      value,
      allocation,
    })),
  )
  const totalValue = mockFidelity.accounts.reduce((sum, a) => sum + a.value, 0)
  const totalCash = mockFidelity.accounts.reduce((sum, a) => sum + a.cash, 0)
  const cashPct = (totalCash / (totalValue + totalCash)) * 100
  const topPosition = [...positions].sort((a, b) => b.value - a.value)[0]

  return { positions, totalValue, totalCash, cashPct, topPosition }
}

function readPaperPortfolio() {
  if (typeof localStorage === 'undefined') return null
  try {
    return JSON.parse(localStorage.getItem(PAPER_TRADING_KEY))
  } catch {
    return null
  }
}

function buildContextBlock() {
  const { totalValue, totalCash, cashPct, topPosition, positions } = buildPortfolioSummary()
  const paper = readPaperPortfolio()

  const lines = [
    `Mock Fidelity brokerage account:`,
    `- Total invested: ${usd.format(totalValue)}, cash: ${usd.format(totalCash)} (${cashPct.toFixed(1)}% of total).`,
    `- Largest position: ${topPosition.symbol} (${topPosition.name}) at ${usd.format(topPosition.value)}.`,
    `- Full holdings: ${positions.map((p) => `${p.symbol} ${p.allocation.toFixed(1)}% (${p.type}, ${p.account})`).join(', ')}.`,
    ``,
    `Startup investment directory (private, illiquid):`,
    ...startups.map(
      (s) => `- ${s.name} (${s.tag}, ${s.stage}): ${s.one} ${s.meta}. Internal evaluation: ${s.evaluation.verdict} (score ${s.evaluation.score}/10) — upside: ${s.evaluation.upside} Risk: ${s.evaluation.risk}`,
    ),
    ``,
    `Public women-led stock watchlist available for paper trading (sample): ${womenLedStocks
      .slice(0, 15)
      .map((s) => `${s.symbol} (${s.name}, ${s.sector})`)
      .join(', ')}.`,
  ]

  if (paper && (paper.positions && Object.keys(paper.positions).length)) {
    const paperHoldings = Object.entries(paper.positions)
      .map(([symbol, shares]) => `${symbol}: ${shares.toFixed(2)} shares`)
      .join(', ')
    lines.push(``, `User's paper-trading simulation: $${paper.cash.toFixed(2)} cash, holding ${paperHoldings}.`)
  }

  const topForumThreads = [...forumPosts]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5)
    .map((p) => {
      const topReply = [...p.replies].sort((a, b) => b.likes - a.likes)[0]
      return `- [${p.category}] "${p.title}": ${p.body} ${topReply ? `Top community reply (${topReply.author}): "${topReply.body}"` : ''}`
    })

  lines.push(``, `Community forum sentiment (top discussions):`, ...topForumThreads)

  return lines.join('\n')
}

const STARTUP_TAG_KEYWORDS = {
  Biotech: ['biotech', 'health', 'medical', 'diagnostic'],
  Fintech: ['fintech', 'payroll', 'gig', 'payment'],
  Climate: ['climate', 'carbon', 'sustainab', 'environment'],
  Hardware: ['hardware', 'materials', 'packaging', 'manufactur'],
  AI: ['ai', 'artificial intelligence', 'machine learning', 'ml'],
  Consumer: ['consumer', 'retail', 'farm', 'grocer'],
}

const FORUM_CATEGORY_KEYWORDS = {
  Investing: ['invest', 'stock', 'etf', 'index fund', 'portfolio'],
  Budgeting: ['budget', 'spending', 'expense'],
  Retirement: ['retire', '401k', 'ira'],
  'Real Estate': ['real estate', 'reit', 'property', 'rental'],
  'Career & Income': ['salary', 'raise', 'income', 'career'],
  'Family Finances': ['kids', 'family', 'emergency fund'],
}

function findMatches(message, keywordMap) {
  const lower = message.toLowerCase()
  return Object.entries(keywordMap)
    .filter(([, keywords]) => keywords.some((k) => lower.includes(k)))
    .map(([key]) => key)
}

function getLocalReply(messages) {
  const lastMessage = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''
  const { totalValue, cashPct, topPosition } = buildPortfolioSummary()

  const matchedTags = findMatches(lastMessage, STARTUP_TAG_KEYWORDS)
  const matchedCategories = findMatches(lastMessage, FORUM_CATEGORY_KEYWORDS)

  const parts = []

  parts.push(
    `Looking at your accounts, you're holding ${usd.format(totalValue)} with ${cashPct.toFixed(1)}% in cash and your biggest position in ${topPosition.symbol}.`,
  )

  const matchingStartups = matchedTags.length
    ? startups.filter((s) => matchedTags.includes(s.tag))
    : startups.filter((s) => s.evaluation.score >= 8)

  if (matchingStartups.length) {
    const picks = matchingStartups.slice(0, 2)
    parts.push(
      `From the startup directory, ${picks
        .map((s) => `${s.name} (${s.tag}, ${s.meta}, evaluation: ${s.evaluation.verdict})`)
        .join(' and ')} might be worth a look.`,
    )
  }

  const relevantPosts = matchedCategories.length
    ? forumPosts.filter((p) => matchedCategories.includes(p.category))
    : []

  if (relevantPosts.length) {
    const post = [...relevantPosts].sort((a, b) => b.likes - a.likes)[0]
    const topReply = [...post.replies].sort((a, b) => b.likes - a.likes)[0]
    parts.push(
      `In the forum, "${post.title}" got a lot of engagement — ${topReply ? `${topReply.author} suggested: "${topReply.body}"` : 'worth a read.'}`,
    )
  }

  parts.push('This is educational context, not personalized financial advice.')

  return parts.join(' ')
}

function buildSystemPrompt() {
  return `You are Rooted AI, the in-app investment advisor for the Rooted platform. You have full visibility into the user's mock Fidelity brokerage account, the startup investment directory, their paper-trading simulation, and community forum discussions — all provided below as live context.

Act as a knowledgeable, personable investment advisor: reason across all of these sources together (e.g. flag concentration risk in their brokerage holdings, suggest specific startups from the directory that match their interests or fill a gap in their portfolio, reference what the community is saying about similar decisions, and factor in their paper-trading behavior as a signal of risk appetite).

Be specific and cite the actual names, tickers, and numbers from the context rather than speaking generically. Keep responses focused and conversational (a few short paragraphs, not an essay). This is a demo with fictional/mock data, so it's safe to give direct, opinionated suggestions — but close with a brief one-line reminder that this is a hackathon demo, not licensed financial advice.

Respond in plain conversational text only — no markdown formatting (no asterisks, no bold/italic syntax, no headers). If you need a list, write it as short sentences or a simple dash-prefixed line, not markdown bullets.

Context:
${buildContextBlock()}`
}

async function callGeminiAPI(messages, systemPrompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    }),
  })
  if (!response.ok) throw new Error('Gemini API request failed')
  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'I had trouble answering that.'
}

export async function getAssistantReply(messages) {
  if (!GEMINI_API_KEY) return getLocalReply(messages)
  try {
    return await callGeminiAPI(messages, buildSystemPrompt())
  } catch {
    return getLocalReply(messages)
  }
}

function buildNegotiationContext() {
  const { name, currentRole, currentSalary, yearsExperience, offer, marketBenchmark } = mockCareerProfile
  return [
    `Candidate: ${name}, currently a ${currentRole} with ${yearsExperience} years of experience, current salary ${usd.format(currentSalary)}.`,
    `Offer on the table from ${offer.company} for the role of ${offer.role}:`,
    `- Base salary: ${usd.format(offer.baseSalary)}`,
    `- Signing bonus: ${usd.format(offer.signingBonus)}`,
    `- Equity: ${offer.equity}`,
    `- Benefits: ${offer.benefits}`,
    `- Proposed start date: ${offer.startDate}`,
    `Market benchmark for this role/experience level: ${usd.format(marketBenchmark)} base salary.`,
  ].join('\n')
}

function buildNegotiationSystemPrompt() {
  return `You are ${mockCareerProfile.offer.hiringManagerName}, the hiring manager at ${mockCareerProfile.offer.company}, roleplaying a live salary negotiation with a candidate over chat. Stay in character as the hiring manager: friendly but represents the company's budget, can concede modestly (a few thousand dollars, a small signing-bonus bump, an extra PTO week) when the candidate makes a reasonable case, but pushes back or holds firm if the ask is unreasonable or unsupported. Never reveal your maximum budget outright.

After your in-character reply, add a line starting with "Coach note:" that gives the candidate brief, specific feedback on the negotiation tactic they just used (what worked, what to try next) — this is the educational point of the exercise.

Respond in plain conversational text only — no markdown formatting (no asterisks, no bold/italic syntax, no headers, no bullet lists).

Context for this negotiation:
${buildNegotiationContext()}`
}

const NEGOTIATION_OPENER = `Hi ${mockCareerProfile.name.split(' ')[0]}, thanks for taking the time today! We'd love to have you join ${mockCareerProfile.offer.company} as our ${mockCareerProfile.offer.role}. Here's what we can offer: ${usd.format(mockCareerProfile.offer.baseSalary)} base salary, a ${usd.format(mockCareerProfile.offer.signingBonus)} signing bonus, ${mockCareerProfile.offer.equity}, and ${mockCareerProfile.offer.benefits}. We'd love for you to start ${mockCareerProfile.offer.startDate}. What are your thoughts?

Coach note: This is your opening offer. Before responding, think about your target number (research suggests similar roles pay around ${usd.format(mockCareerProfile.marketBenchmark)}) and what you'll ask for first — base salary is usually worth anchoring on before bonus or PTO.`

export async function getNegotiationOpener() {
  if (!GEMINI_API_KEY) return NEGOTIATION_OPENER
  try {
    return await callGeminiAPI(
      [{ role: 'user', content: 'Open the negotiation by extending the offer described in your context.' }],
      buildNegotiationSystemPrompt(),
    )
  } catch {
    return NEGOTIATION_OPENER
  }
}

const NEGOTIATION_KEYWORD_REPLIES = [
  {
    keywords: ['market rate', 'market value', 'research shows', 'comparable', 'benchmark'],
    reply: `That's fair, and you've clearly done your research. I can move the base up to ${usd.format(mockCareerProfile.offer.baseSalary + 3000)} to reflect that — I can't quite get to the full market number, but that's a meaningful step.`,
    coach: 'Citing a market benchmark is one of the strongest anchors in a negotiation — it worked here. Next, try asking if there is any flexibility on the signing bonus too.',
  },
  {
    keywords: ['sign', 'bonus'],
    reply: `We do have some room on the signing bonus. I can bump it from ${usd.format(mockCareerProfile.offer.signingBonus)} to ${usd.format(mockCareerProfile.offer.signingBonus + 1000)}.`,
    coach: 'Signing bonuses are often easier for companies to move than base salary since they are one-time costs. Good target to ask about.',
  },
  {
    keywords: ['pto', 'vacation', 'time off'],
    reply: `PTO is actually unlimited in this role already, so there is not much more room there, but I hear that work-life balance matters to you — let's make sure your manager knows that from day one.`,
    coach: 'Good instinct to think beyond salary, but check what is already offered before asking — here PTO was already uncapped.',
  },
  {
    keywords: ['equity', 'stock', 'rsu'],
    reply: `The equity grant is fairly standard for this level, but I can flag your interest in more with the team for your first review cycle.`,
    coach: 'Equity is usually the hardest lever to move pre-hire. Framing it as "worth revisiting at the first review" keeps the door open without stalling the offer.',
  },
  {
    keywords: ['no', 'not enough', 'too low', 'decline'],
    reply: `I understand — I do not want to lose you over this. Let me see what else I can do and get back to you with a revised number.`,
    coach: 'Pushing back respectfully when a number feels low is reasonable, but pair it with a specific counter-number next time rather than just "not enough" — it gives the other side something concrete to respond to.',
  },
  {
    keywords: ['accept', 'deal', 'sounds good', 'works for me'],
    reply: `Fantastic, welcome to the team! I'll get the paperwork started.`,
    coach: 'Before accepting, it is always worth asking "is this the best you can do?" once — many candidates leave money on the table by accepting the first revised offer.',
  },
]

function getLocalNegotiationReply(messages) {
  const lastMessage = [...messages].reverse().find((m) => m.role === 'user')?.content?.toLowerCase() ?? ''
  const match = NEGOTIATION_KEYWORD_REPLIES.find((entry) => entry.keywords.some((k) => lastMessage.includes(k)))

  if (match) return `${match.reply}\n\nCoach note: ${match.coach}`

  return `That's a fair point — let me think about what flexibility we have and come back to you. Is there a specific number or benefit you're hoping to land on?\n\nCoach note: Try anchoring on a specific number backed by research (e.g. "similar roles pay around ${usd.format(mockCareerProfile.marketBenchmark)}") — vague asks are easy to deflect.`
}

export async function getNegotiationReply(messages) {
  if (!GEMINI_API_KEY) return getLocalNegotiationReply(messages)
  try {
    return await callGeminiAPI(messages, buildNegotiationSystemPrompt())
  } catch {
    return getLocalNegotiationReply(messages)
  }
}
