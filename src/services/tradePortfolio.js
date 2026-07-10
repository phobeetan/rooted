import { mockFidelity } from '../data/rootedData.js'

export const TRADE_STORAGE_KEY = 'rooted-trade-portfolio-fidelity'
export const fidelityCash = mockFidelity.accounts.reduce((sum, account) => sum + account.cash, 0)

export function freshTradeState() {
  return { cash: fidelityCash, positions: {}, prices: {}, orders: [], donations: [] }
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

export function buildMockFidelityPortfolio(trade, assets = []) {
  if (!trade?.orders?.length && !trade?.donations?.length && !Object.keys(trade?.positions || {}).length) return mockFidelity

  const assetBySymbol = new Map(assets.map((asset) => [asset.symbol, asset]))
  const holdings = Object.entries(trade.positions).map(([symbol, quantity]) => {
    const asset = assetBySymbol.get(symbol)
    const order = trade.orders.find((item) => item.symbol === symbol)
    const price = asset?.price || trade.prices?.[symbol] || order?.price || 0
    return {
      symbol,
      quantity,
      price,
      name: asset?.name || order?.name || symbol,
      type: asset?.type || order?.assetType || 'stock',
      value: quantity * price,
    }
  })
  const holdingsValue = holdings.reduce((sum, holding) => sum + holding.value, 0)
  const accountValue = trade.cash + holdingsValue

  return {
    ...mockFidelity,
    accounts: [
      ...mockFidelity.accounts.map((account) => ({
        ...account,
        value: account.value - account.cash,
        cash: 0,
        settledCash: 0,
        cashAvailableToTrade: 0,
      })),
      {
        type: 'Trade Account',
        accountNumber: 'Simulation',
        value: accountValue,
        cash: trade.cash,
        settledCash: trade.cash,
        cashAvailableToTrade: trade.cash,
        positions: holdings.map((holding) => ({
          symbol: holding.symbol,
          name: holding.name,
          type: holding.type,
          value: holding.value,
          allocation: accountValue ? (holding.value / accountValue) * 100 : 0,
          shares: holding.quantity,
          price: holding.price,
        })),
      },
    ],
    recentActivity: [
      ...(trade.donations || []).map((donation) => ({
        date: donation.time,
        type: 'donation',
        symbol: donation.name,
        amount: -donation.amount,
      })),
      ...trade.orders.map((order) => ({
        date: order.time,
        type: order.side,
        symbol: order.symbol,
        amount: order.side === 'buy' ? -order.total : order.total,
      })),
      ...mockFidelity.recentActivity,
    ],
  }
}
