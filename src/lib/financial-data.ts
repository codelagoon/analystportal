type FinancialQuote = {
  symbol: string
  name?: string
  price: number
  changePercent?: number
  marketCap?: number
  pe?: number
}

const DEFAULT_API_BASE_URL = 'https://financialmodelingprep.com/api/v3'
const STOOQ_BASE_URL = 'https://stooq.com/q/l/'
const FINANCIALDATA_NET_BASE_URL = 'https://api.financialdata.net/quote'
const FINANCIALDATA_NET_API_KEY = process.env.FINANCIALDATA_NET_API_KEY || '5b136ea2fe745b258da0e069bddb5163'

const STOOQ_SYMBOL_OVERRIDES: Record<string, string> = {
  SPY: 'spy.us',
  QQQ: 'qqq.us',
  DIA: 'dia.us',
  VXX: 'vxx.us',
}

function isAlphaVantageBaseUrl(baseUrl: string) {
  return baseUrl.includes('alphavantage.co')
}

function isFinnhubBaseUrl(baseUrl: string) {
  return baseUrl.includes('finnhub.io')
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseNumericValue(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ''))
    return Number.isFinite(parsed) ? parsed : undefined
  }

  return undefined
}

function resolveApiBaseUrl() {
  return (process.env.FINANCIAL_DATA_API_URL?.trim() || DEFAULT_API_BASE_URL).replace(/\/$/, '')
}

function resolveStooqSymbol(symbol: string) {
  return STOOQ_SYMBOL_OVERRIDES[symbol.toUpperCase()] ?? `${symbol.toLowerCase()}.us`
}

async function getFinancialQuoteFromStooq(symbol: string): Promise<FinancialQuote | null> {
  const stooqSymbol = resolveStooqSymbol(symbol)
  const url = new URL(STOOQ_BASE_URL)
  url.searchParams.set('s', stooqSymbol)

  try {
    const response = await fetch(url, {
      next: {
        revalidate: 0,
      },
    })

    if (!response.ok) {
      return null
    }

    const text = await response.text()
    const lines = text.trim().split('\n')
    
    // Stooq returns: header line + data line(s)
    if (lines.length < 2) {
      return null
    }

    // Parse data line (skip header)
    const dataLine = lines[1].split(',').map(v => v.trim())
    
    if (dataLine.length < 7) {
      return null
    }

    // Columns typically: Symbol, Date, Time, Open, High, Low, Close, Volume, [Change %]
    // We want Close (column 6)
    const closePrice = parseNumericValue(dataLine[6])
    const openPrice = parseNumericValue(dataLine[3])
    
    if (closePrice === undefined || closePrice <= 0) {
      return null
    }

    // Try to use actual change from Stooq if available (column 8)
    let changePercent: number | undefined
    if (dataLine.length > 8) {
      changePercent = parseNumericValue(dataLine[8])
    } else if (openPrice !== undefined && openPrice > 0) {
      changePercent = Number((((closePrice - openPrice) / openPrice) * 100).toFixed(2))
    }

    return {
      symbol,
      name: symbol,
      price: closePrice,
      changePercent,
    }
  } catch (error) {
    console.error(`[Stooq] Failed to fetch ${symbol}:`, error)
    return null
  }
}

async function getFinancialQuoteFromFinancialDataNet(symbol: string): Promise<FinancialQuote | null> {
  const url = new URL(FINANCIALDATA_NET_BASE_URL)
  url.searchParams.set('ticker', symbol)
  url.searchParams.set('apikey', FINANCIALDATA_NET_API_KEY)

  try {
    const response = await fetch(url, {
      next: {
        revalidate: 0,
      },
    })

    if (!response.ok) {
      return getFinancialQuoteFromStooq(symbol)
    }

    const payload = (await response.json()) as Record<string, unknown>
    
    if (!payload || typeof payload !== 'object') {
      return getFinancialQuoteFromStooq(symbol)
    }

    // financialdata.net returns: { price, change, changePercent, name, ... }
    const price = parseNumericValue(payload.price)
    
    if (price === undefined || price <= 0) {
      return getFinancialQuoteFromStooq(symbol)
    }

    return {
      symbol,
      name: typeof payload.name === 'string' ? payload.name : symbol,
      price,
      changePercent: parseNumericValue(payload.changePercent) ?? parseNumericValue(payload.change),
    }
  } catch (error) {
    console.error(`[FinancialData.net] Failed to fetch ${symbol}:`, error)
    return getFinancialQuoteFromStooq(symbol)
  }
}

export async function getFinancialQuote(symbol: string): Promise<FinancialQuote | null> {
  const apiKey = process.env.FINANCIAL_DATA_API_KEY?.trim()
  if (!apiKey) {
    return getFinancialQuoteFromStooq(symbol)
  }

  const baseUrl = resolveApiBaseUrl()
  const isAlphaVantage = isAlphaVantageBaseUrl(baseUrl)
  const isFinnhub = isFinnhubBaseUrl(baseUrl)
  const url = isAlphaVantage
    ? new URL(baseUrl)
    : isFinnhub
      ? new URL(`${baseUrl}/quote`)
      : new URL(`${baseUrl}/quote/${encodeURIComponent(symbol)}`)

  if (isAlphaVantage) {
    url.searchParams.set('function', 'GLOBAL_QUOTE')
    url.searchParams.set('symbol', symbol)
    url.searchParams.set('apikey', apiKey)
  } else if (isFinnhub) {
    url.searchParams.set('symbol', symbol)
    url.searchParams.set('token', apiKey)
  } else {
    url.searchParams.set('apikey', apiKey)
  }

  try {
    const response = await fetch(url, {
      next: {
        revalidate: 0,
      },
    })

    if (!response.ok) {
      return getFinancialQuoteFromFinancialDataNet(symbol)
    }

    const payload = (await response.json()) as Record<string, unknown>
    const rawRecord = isAlphaVantage
      ? (payload['Global Quote'] as Record<string, unknown> | undefined)
      : ((Array.isArray(payload) ? payload[0] : payload) as Record<string, unknown> | undefined)

    if (!rawRecord || typeof rawRecord !== 'object') {
      return getFinancialQuoteFromFinancialDataNet(symbol)
    }

    const data = rawRecord
    const price = isAlphaVantage
      ? parseNumericValue(data['05. price'])
      : isFinnhub
        ? parseNumericValue(data.c)
        : parseNumericValue(data.price)

    if (price === undefined) {
      return getFinancialQuoteFromFinancialDataNet(symbol)
    }

    return {
      symbol,
      name: isAlphaVantage
        ? (typeof data['01. symbol'] === 'string' ? data['01. symbol'] : undefined)
        : isFinnhub
          ? symbol
        : (typeof data.name === 'string' ? data.name : undefined),
      price,
      changePercent: isAlphaVantage
        ? parseNumericValue(data['10. change percent'])
        : isFinnhub
          ? parseNumericValue(data.dp)
        : parseNumericValue(data.changesPercentage),
      marketCap: isAlphaVantage || isFinnhub ? undefined : parseNumericValue(data.marketCap),
      pe: isAlphaVantage || isFinnhub ? undefined : parseNumericValue(data.pe),
    }
  } catch {
    return getFinancialQuoteFromFinancialDataNet(symbol)
  }
}

export async function getFinancialQuotes(symbols: string[]): Promise<Array<FinancialQuote | null>> {
  const baseUrl = resolveApiBaseUrl()
  const isAlphaVantage = isAlphaVantageBaseUrl(baseUrl)

  // Fetch all quotes in parallel for better performance
  if (!isAlphaVantage) {
    return Promise.all(symbols.map((symbol) => getFinancialQuote(symbol)))
  }

  // For Alpha Vantage, respect rate limits with sequential + delays
  const results: Array<FinancialQuote | null> = []
  for (let index = 0; index < symbols.length; index += 1) {
    const symbol = symbols[index]
    const quote = await getFinancialQuote(symbol)
    results.push(quote)

    if (index < symbols.length - 1) {
      await wait(1200)
    }
  }

  return results
}

export type SectorPerformance = {
  sector: string
  symbol: string
  changePercent: number
  relativePerformance: number
}

export async function getSectorPerformance(): Promise<SectorPerformance[]> {
  const sectorEtfs = [
    { sector: 'Technology', symbol: 'XLK' },
    { sector: 'Energy', symbol: 'XLE' },
    { sector: 'Industrials', symbol: 'XLI' },
    { sector: 'Healthcare', symbol: 'XLV' },
    { sector: 'Consumer Discretionary', symbol: 'XLY' },
    { sector: 'Real Estate', symbol: 'XLRE' },
    { sector: 'Financials', symbol: 'XLF' },
    { sector: 'Utilities', symbol: 'XLU' },
    { sector: 'Materials', symbol: 'XLB' },
    { sector: 'Communication Services', symbol: 'XLC' },
  ]

  // Fetch all sector ETFs + SPY in parallel
  const allSymbols = [
    'SPY',
    ...sectorEtfs.map((s) => s.symbol),
  ]
  const quotes = await getFinancialQuotes(allSymbols)

  const spyQuote = quotes[0]
  const spyReturn = spyQuote?.changePercent ?? 0

  const results: SectorPerformance[] = []
  for (let index = 0; index < sectorEtfs.length; index += 1) {
    const quote = quotes[index + 1]
    const sectorInfo = sectorEtfs[index]

    if (quote?.changePercent !== undefined) {
      results.push({
        sector: sectorInfo.sector,
        symbol: sectorInfo.symbol,
        changePercent: quote.changePercent,
        relativePerformance: quote.changePercent - spyReturn,
      })
    }
  }

  return results.sort((a, b) => b.relativePerformance - a.relativePerformance)
}
