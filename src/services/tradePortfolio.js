import { mockFidelity } from '../data/rootedData.js'

export const TRADE_STORAGE_KEY = 'rooted-trade-portfolio-fidelity'
export const fidelityCash = mockFidelity.accounts.reduce((sum, account) => sum + account.cash, 0)

export function freshTradeState() {
  return { cash: fidelityCash, positions: {}, prices: {}, orders: [] }
}

export function readTradeState() {
  if (typeof localStorage === 'undefined') return freshTradeState()
  try {
    const saved = JSON.parse(localStorage.getItem(TRADE_STORAGE_KEY))
    return saved ? { ...freshTradeState(), ...saved } : freshTradeState()
  } catch {
    return freshTradeState()
  }
}

export function buildMockFidelityPortfolio(trade, stocks) {
  if (!trade?.orders?.length && !Object.keys(trade?.positions || {}).length) return mockFidelity

  const holdings = Object.entries(trade.positions).map(([symbol, quantity]) => {
    const stock = stocks.find((item) => item.symbol === symbol)
    const price = stock?.price || trade.prices?.[symbol] || trade.orders.find((order) => order.symbol === symbol)?.price || 0
    return { symbol, quantity, price, name: stock?.name || symbol, value: quantity * price }
  })
  const holdingsValue = holdings.reduce((sum, holding) => sum + holding.value, 0)
  const accountValue = trade.cash + holdingsValue

  return {
    ...mockFidelity,
    accounts: [
      ...mockFidelity.accounts.map((account) => ({ ...account, cash: 0 })),
      {
        type: 'Trade Account',
        value: accountValue,
        cash: trade.cash,
        positions: holdings.map((holding) => [
          holding.symbol,
          holding.name,
          'stock',
          holding.value,
          accountValue ? (holding.value / accountValue) * 100 : 0,
        ]),
      },
    ],
  }
}
