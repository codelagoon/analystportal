type FinancialQuote = {
  symbol: string
  name?: string
  price: number
  changePercent?: number
  marketCap?: number
  pe?: number
}

const DEFAULT_API_BASE_URL = 'https://financialmodelingprep.com/api/v3'

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

export async function getFinancialQuote(symbol: string): Promise<FinancialQuote | null> {
  const apiKey = process.env.FINANCIAL_DATA_API_KEY?.trim()
  if (!apiKey) {
    return null
  }

  const baseUrl = resolveApiBaseUrl()
  const url = new URL(`${baseUrl}/quote/${encodeURIComponent(symbol)}`)
  url.searchParams.set('apikey', apiKey)

  try {
    const response = await fetch(url, {
      next: {
        revalidate: 300,
      },
    })

    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as unknown
    const record = Array.isArray(payload) ? payload[0] : payload

    if (!record || typeof record !== 'object') {
      return null
    }

    const data = record as Record<string, unknown>
    const price = parseNumericValue(data.price)

    if (price === undefined) {
      return null
    }

    return {
      symbol,
      name: typeof data.name === 'string' ? data.name : undefined,
      price,
      changePercent: parseNumericValue(data.changesPercentage),
      marketCap: parseNumericValue(data.marketCap),
      pe: parseNumericValue(data.pe),
    }
  } catch {
    return null
  }
}
