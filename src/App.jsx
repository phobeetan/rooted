import { useState } from 'react'
import './App.css'

const mockFidelityData = {
  provider: 'mock_fidelity',
  accountHolder: 'Demo User',
  accounts: [
    {
      accountId: 'mock-fidelity-brokerage-001',
      accountType: 'Individual Brokerage',
      portfolioValue: 42850.75,
      cashBalance: 2355.87,
      totalInvested: 37000,
      dailyChange: 312.48,
      dailyChangePercent: 0.73,
      totalGainLoss: 5850.75,
      positions: [
        {
          ticker: 'AAPL',
          name: 'Apple Inc.',
          assetType: 'stock',
          shares: 12,
          averageCost: 155.2,
          currentPrice: 218.5,
          marketValue: 2622,
          gainLoss: 759.6,
          gainLossPercent: 40.78,
          allocationPercent: 6.12,
        },
        {
          ticker: 'MSFT',
          name: 'Microsoft Corp.',
          assetType: 'stock',
          shares: 18,
          averageCost: 335,
          currentPrice: 497.2,
          marketValue: 8949.6,
          gainLoss: 2919.6,
          gainLossPercent: 48.42,
          allocationPercent: 20.89,
        },
        {
          ticker: 'VOO',
          name: 'Vanguard S&P 500 ETF',
          assetType: 'etf',
          shares: 20,
          averageCost: 420,
          currentPrice: 566.44,
          marketValue: 11328.8,
          gainLoss: 2928.8,
          gainLossPercent: 34.87,
          allocationPercent: 26.44,
        },
        {
          ticker: 'NVDA',
          name: 'Nvidia Corp.',
          assetType: 'stock',
          shares: 24,
          averageCost: 98.4,
          currentPrice: 162.15,
          marketValue: 3891.6,
          gainLoss: 1530,
          gainLossPercent: 64.79,
          allocationPercent: 9.08,
        },
        {
          ticker: 'TSLA',
          name: 'Tesla Inc.',
          assetType: 'stock',
          shares: 8,
          averageCost: 240,
          currentPrice: 315.3,
          marketValue: 2522.4,
          gainLoss: 602.4,
          gainLossPercent: 31.38,
          allocationPercent: 5.89,
        },
        {
          ticker: 'SCHD',
          name: 'Schwab Dividend ETF',
          assetType: 'etf',
          shares: 75,
          averageCost: 25,
          currentPrice: 27.75,
          marketValue: 2081.25,
          gainLoss: 206.25,
          gainLossPercent: 11,
          allocationPercent: 4.86,
        },
        {
          ticker: 'FSKAX',
          name: 'Fidelity Total Market Index Fund',
          assetType: 'mutual_fund',
          shares: 138.75,
          averageCost: 63.75,
          currentPrice: 65.58,
          marketValue: 9099.23,
          gainLoss: 253.91,
          gainLossPercent: 2.87,
          allocationPercent: 21.23,
        },
      ],
      otherInvestments: [
        { label: 'ETFs', value: 13410.05, tickers: ['VOO', 'SCHD'] },
        { label: 'Mutual funds', value: 9099.23, tickers: ['FSKAX'] },
        { label: 'Cash', value: 2355.87, tickers: ['CORE'] },
        { label: 'Retirement holdings', value: 12000, tickers: ['VOO', 'FSKAX'] },
      ],
    },
    {
      accountId: 'mock-fidelity-roth-002',
      accountType: 'Roth IRA',
      portfolioValue: 18425.12,
      cashBalance: 1100,
      totalInvested: 15000,
      dailyChange: 88.19,
      dailyChangePercent: 0.48,
      totalGainLoss: 3425.12,
      positions: [
        {
          ticker: 'VOO',
          name: 'Vanguard S&P 500 ETF',
          assetType: 'etf',
          shares: 18,
          averageCost: 431,
          currentPrice: 566.44,
          marketValue: 10195.92,
          gainLoss: 2437.92,
          gainLossPercent: 31.42,
          allocationPercent: 55.34,
        },
        {
          ticker: 'FSKAX',
          name: 'Fidelity Total Market Index Fund',
          assetType: 'mutual_fund',
          shares: 108.75,
          averageCost: 62.5,
          currentPrice: 65.58,
          marketValue: 7131.08,
          gainLoss: 334.95,
          gainLossPercent: 4.93,
          allocationPercent: 38.7,
        },
      ],
      otherInvestments: [
        { label: 'ETFs', value: 10195.92, tickers: ['VOO'] },
        { label: 'Mutual funds', value: 7131.08, tickers: ['FSKAX'] },
        { label: 'Cash', value: 1100, tickers: ['CORE'] },
        { label: 'Retirement account holdings', value: 17327, tickers: ['VOO', 'FSKAX'] },
      ],
    },
  ],
}

const startups = [
  {
    name: 'Lumina Health',
    founders: ['Aisha Khan'],
    description: "AI-powered care navigation for women's health.",
    category: 'Health',
    stage: 'Seed',
    tags: ['AI', 'Health', "Women's Health"],
  },
  {
    name: 'FinRise',
    founders: ['Maya Patel', 'Sofia Chen'],
    description: 'Financial tools helping early-career women build investing confidence.',
    category: 'Fintech',
    stage: 'Pre-seed',
    tags: ['Fintech', 'Investing', 'Career'],
  },
  {
    name: 'ClassBloom',
    founders: ['Nora Williams'],
    description: 'Simple classroom planning tools for independent tutors and micro-schools.',
    category: 'Education',
    stage: 'MVP',
    tags: ['Education', 'SaaS'],
  },
  {
    name: 'LoopCraft',
    founders: ['Elena Garcia', 'Priya Mehta'],
    description: 'No-code workflow templates for small ecommerce teams.',
    category: 'Productivity',
    stage: 'Series A',
    tags: ['No-code', 'Ecommerce'],
  },
  {
    name: 'CareNest',
    founders: ['Jasmine Reed'],
    description: 'A care coordination app for families managing elder care.',
    category: 'Health',
    stage: 'Idea',
    tags: ['Health', 'Family'],
  },
  {
    name: 'GreenLedger',
    founders: ['Amara Okafor'],
    description: 'Carbon tracking and reporting for growing local businesses.',
    category: 'Climate',
    stage: 'Growth',
    tags: ['Climate', 'B2B'],
  },
]

const stages = ['All stages', ...new Set(startups.map((startup) => startup.stage))]
const categories = ['All categories', ...new Set(startups.map((startup) => startup.category))]

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

function signedMoney(value) {
  return `${value >= 0 ? '+' : '-'}${money.format(Math.abs(value))}`
}

function signedPercent(value) {
  return `${value >= 0 ? '+' : '-'}${Math.abs(value).toFixed(2)}%`
}

function StartupDirectory() {
  const [stage, setStage] = useState('All stages')
  const [category, setCategory] = useState('All categories')

  const filteredStartups = startups.filter((startup) => {
    return (
      (stage === 'All stages' || startup.stage === stage) &&
      (category === 'All categories' || startup.category === category)
    )
  })

  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">YC-style directory</p>
        <h1>Women-Led Startups</h1>
        <p className="heroText">
          Discover startups founded or co-founded by women and track their growth stage.
        </p>
      </section>

      <section className="filters" aria-label="Startup filters">
        <label>
          Stage
          <select value={stage} onChange={(event) => setStage(event.target.value)}>
            {stages.map((stageOption) => (
              <option key={stageOption}>{stageOption}</option>
            ))}
          </select>
        </label>

        <label>
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((categoryOption) => (
              <option key={categoryOption}>{categoryOption}</option>
            ))}
          </select>
        </label>
      </section>

      <section className="startupList" aria-label="Women-led startups">
        {filteredStartups.map((startup) => (
          <article className="startupCard" key={startup.name}>
            <div className="startupHeader">
              <div>
                <h2>{startup.name}</h2>
                <p>{startup.founders.join(', ')}</p>
              </div>
              <span>{startup.stage}</span>
            </div>

            <p className="description">{startup.description}</p>

            <div className="meta">
              <strong>{startup.category}</strong>
              <div>
                {startup.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="submit">
        <div>
          <h2>Submit a Women-Led Startup</h2>
          <p>Submission form coming soon. For now, this is a hackathon placeholder.</p>
        </div>
        <button disabled>Submit a Women-Led Startup</button>
      </section>
    </main>
  )
}

function MockFidelityDashboard() {
  const [status, setStatus] = useState('idle')
  const accountTotals = mockFidelityData.accounts.reduce(
    (totals, account) => ({
      portfolioValue: totals.portfolioValue + account.portfolioValue,
      cashBalance: totals.cashBalance + account.cashBalance,
      totalInvested: totals.totalInvested + account.totalInvested,
      dailyChange: totals.dailyChange + account.dailyChange,
      totalGainLoss: totals.totalGainLoss + account.totalGainLoss,
    }),
    {
      portfolioValue: 0,
      cashBalance: 0,
      totalInvested: 0,
      dailyChange: 0,
      totalGainLoss: 0,
    },
  )
  const allPositions = mockFidelityData.accounts.flatMap((account) => account.positions)
  const allOtherInvestments = mockFidelityData.accounts.flatMap((account) =>
    account.otherInvestments.map((investment) => ({
      ...investment,
      accountType: account.accountType,
    })),
  )

  async function sendToRooted() {
    setStatus('sending')

    try {
      const response = await fetch('/api/mock-fidelity/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...mockFidelityData,
          syncedAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Request failed')
      }

      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <main className="brokerageApp">
      <section className="brokerageHeader">
        <div>
          <p className="brokerageEyebrow">Fake brokerage demo</p>
          <h1>Mock Fidelity Account</h1>
          <p>This dashboard uses local mock data only. No Fidelity login or real API is used.</p>
        </div>
        <button onClick={sendToRooted} disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending...' : 'Send Data to Rooted'}
        </button>
      </section>

      {status === 'success' && <p className="successMessage">Mock Fidelity data sent to Rooted</p>}
      {status === 'error' && <p className="errorMessage">Failed to send mock Fidelity data</p>}

      <section className="accountSummary" aria-label="Account summary">
        <div>
          <span>Account holder</span>
          <strong>{mockFidelityData.accountHolder}</strong>
        </div>
        <div>
          <span>Total portfolio value</span>
          <strong>{money.format(accountTotals.portfolioValue)}</strong>
        </div>
        <div>
          <span>Cash balance</span>
          <strong>{money.format(accountTotals.cashBalance)}</strong>
        </div>
        <div>
          <span>Total invested</span>
          <strong>{money.format(accountTotals.totalInvested)}</strong>
        </div>
        <div>
          <span>Daily change</span>
          <strong className="positive">{signedMoney(accountTotals.dailyChange)}</strong>
          <small>Today</small>
        </div>
        <div>
          <span>Total gain/loss</span>
          <strong className="positive">{signedMoney(accountTotals.totalGainLoss)}</strong>
        </div>
      </section>

      <section className="accountsGrid" aria-label="Mock accounts">
        {mockFidelityData.accounts.map((account) => (
          <article className="accountCard" key={account.accountId}>
            <div>
              <h2>{account.accountType}</h2>
              <p>{account.accountId}</p>
            </div>
            <strong>{money.format(account.portfolioValue)}</strong>
          </article>
        ))}
      </section>

      <section className="brokerageSection" aria-label="Investment positions">
        <div className="sectionHeader">
          <h2>Investment Positions</h2>
          <p>Stocks, ETFs, and mutual funds from the mock accounts.</p>
        </div>
        <div className="positionsTableWrap">
          <table className="positionsTable">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Name</th>
                <th>Type</th>
                <th>Shares</th>
                <th>Average cost</th>
                <th>Current price</th>
                <th>Market value</th>
                <th>Gain/loss</th>
                <th>Allocation</th>
              </tr>
            </thead>
            <tbody>
              {allPositions.map((position) => (
                <tr key={`${position.ticker}-${position.marketValue}`}>
                  <td>
                    <strong>{position.ticker}</strong>
                  </td>
                  <td>{position.name}</td>
                  <td>{position.assetType.replace('_', ' ')}</td>
                  <td>{position.shares}</td>
                  <td>{money.format(position.averageCost)}</td>
                  <td>{money.format(position.currentPrice)}</td>
                  <td>{money.format(position.marketValue)}</td>
                  <td className="positive">
                    {signedMoney(position.gainLoss)} ({signedPercent(position.gainLossPercent)})
                  </td>
                  <td>{position.allocationPercent.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="brokerageSection" aria-label="Other investments">
        <div className="sectionHeader">
          <h2>Other Investments</h2>
          <p>Simple grouped view for ETFs, mutual funds, cash, and retirement holdings.</p>
        </div>
        <div className="otherInvestments">
          {allOtherInvestments.map((investment) => (
            <article key={`${investment.accountType}-${investment.label}`}>
              <span>{investment.accountType}</span>
              <h3>{investment.label}</h3>
              <strong>{money.format(investment.value)}</strong>
              <p>{investment.tickers.join(', ')}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function RootedMockImportPreview() {
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState('')

  async function loadLastImport() {
    setError('')

    try {
      const response = await fetch('/api/mock-fidelity/import')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Request failed')
      }

      setPayload(result.data)
    } catch {
      setError('No mock Fidelity data has been received yet')
    }
  }

  return (
    <main className="brokerageApp">
      <section className="brokerageHeader">
        <div>
          <p className="brokerageEyebrow">Rooted mock receiver</p>
          <h1>Last Mock Fidelity Import</h1>
          <p>Shows the last mock brokerage payload received by Rooted during this dev session.</p>
        </div>
        <button onClick={loadLastImport}>Load Last Import</button>
      </section>

      {error && <p className="errorMessage">{error}</p>}
      {payload && (
        <section className="brokerageSection">
          <div className="sectionHeader">
            <h2>{payload.accountHolder}</h2>
            <p>
              {payload.provider} synced at {payload.syncedAt}
            </p>
          </div>
          <pre className="payloadPreview">{JSON.stringify(payload, null, 2)}</pre>
        </section>
      )}
    </main>
  )
}

function App() {
  const path = window.location.pathname

  if (path === '/mock-fidelity') {
    return <MockFidelityDashboard />
  }

  if (path === '/rooted/mock-fidelity-received') {
    return <RootedMockImportPreview />
  }

  return <StartupDirectory />
}

export default App
