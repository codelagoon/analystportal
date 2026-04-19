type CompanyNewsItem = {
  title: string
  publishedAt: string
  source?: string
  url?: string
  summary?: string
}

type CompanyFilingItem = {
  type: string
  filingDate: string
  acceptedDate?: string
  cik?: string
  finalLink?: string
}

type FmpCompanyData = {
  news: CompanyNewsItem[]
  filings: CompanyFilingItem[]
  hasApiKey: boolean
  errorMessage?: string
}

const FMP_BASE_URL = 'https://financialmodelingprep.com/stable'
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1'

function resolveFmpKey() {
  return (
    process.env.FMP_API_KEY?.trim() ||
    process.env.FINANCIAL_MODELING_PREP_API_KEY?.trim() ||
    process.env.FMP_KEY?.trim() ||
    ''
  )
}

function resolveFmpBaseUrl() {
  return (process.env.FMP_API_URL?.trim() || FMP_BASE_URL).replace(/\/$/, '')
}

function resolveFinnhubKey() {
  const configuredBaseUrl = process.env.FINANCIAL_DATA_API_URL?.trim() || ''

  if (configuredBaseUrl.includes('finnhub.io') && process.env.FINANCIAL_DATA_API_KEY?.trim()) {
    return process.env.FINANCIAL_DATA_API_KEY.trim()
  }

  return (
    process.env.FINNHUB_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_FINNHUB_KEY?.trim() ||
    process.env.FINANCIAL_DATA_API_KEY?.trim() ||
    ''
  )
}

function isFmpAccessRestricted(errorMessage: string | undefined) {
  if (!errorMessage) {
    return false
  }

  const normalized = errorMessage.toLowerCase()
  return (
    normalized.includes('(403)') ||
    normalized.includes('restricted endpoint') ||
    normalized.includes('legacy endpoint') ||
    normalized.includes('subscription')
  )
}

function normalizeDate(input: string | undefined) {
  if (!input) {
    return 'Unknown date'
  }

  const date = new Date(input)
  if (Number.isNaN(date.getTime())) {
    return input
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

async function fetchArrayPayload<T>(url: URL): Promise<{ data: T[]; errorMessage?: string }> {
  const response = await fetch(url, {
    next: {
      revalidate: 0,
    },
  })

  if (!response.ok) {
    return {
      data: [],
      errorMessage: `FMP request failed (${response.status})`,
    }
  }

  const payload = (await response.json()) as unknown
  if (Array.isArray(payload)) {
    return {
      data: payload as T[],
    }
  }

  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>
    let message: string | null = null
    
    if (typeof obj.message === 'string') {
      message = obj.message
    } else if (typeof obj['Error Message'] === 'string') {
      message = obj['Error Message']
    }

    return {
      data: [],
      errorMessage: message ?? 'FMP returned an unexpected response format.',
    }
  }

  return {
    data: [],
    errorMessage: 'FMP returned an unexpected response format.',
  }
}

async function getFmpCompanyNews(
  symbol: string,
  apiKey: string,
): Promise<{ rows: CompanyNewsItem[]; errorMessage?: string }> {
  const url = new URL(`${resolveFmpBaseUrl()}/news/stock`)
  url.searchParams.set('symbols', symbol)
  url.searchParams.set('limit', '8')
  url.searchParams.set('apikey', apiKey)

  const payload = await fetchArrayPayload<Record<string, unknown>>(url)
  const rows = payload.data

  return {
    rows: rows
      .map((row): CompanyNewsItem | null => {
        const title = typeof row.title === 'string' ? row.title.trim() : ''
        if (!title) {
          return null
        }

        return {
          title,
          publishedAt: normalizeDate(typeof row.publishedDate === 'string' ? row.publishedDate : undefined),
          source: typeof row.site === 'string' ? row.site : undefined,
          url: typeof row.url === 'string' ? row.url : undefined,
          summary: typeof row.text === 'string' ? row.text : undefined,
        }
      })
      .filter((row): row is CompanyNewsItem => row !== null),
    errorMessage: payload.errorMessage,
  }
}

async function getFmpCompanyFilings(
  symbol: string,
  apiKey: string,
): Promise<{ rows: CompanyFilingItem[]; errorMessage?: string }> {
  const url = new URL(`${resolveFmpBaseUrl()}/sec-filings-search`)
  url.searchParams.set('symbol', symbol)
  url.searchParams.set('page', '0')
  url.searchParams.set('limit', '10')
  url.searchParams.set('apikey', apiKey)

  const payload = await fetchArrayPayload<Record<string, unknown>>(url)
  const rows = payload.data

  return {
    rows: rows
      .map((row) => {
        const filingType = typeof row.type === 'string' ? row.type : 'Filing'
        const filingDate = normalizeDate(typeof row.fillingDate === 'string' ? row.fillingDate : undefined)

        return {
          type: filingType,
          filingDate,
          acceptedDate: normalizeDate(typeof row.acceptedDate === 'string' ? row.acceptedDate : undefined),
          cik: typeof row.cik === 'string' ? row.cik : undefined,
          finalLink: typeof row.finalLink === 'string' ? row.finalLink : undefined,
        }
      })
      .slice(0, 10),
    errorMessage: payload.errorMessage,
  }
}

async function getFinnhubCompanyNews(symbol: string, apiKey: string): Promise<CompanyNewsItem[]> {
  const now = new Date()
  const from = new Date(now)
  from.setDate(from.getDate() - 14)

  const url = new URL(`${FINNHUB_BASE_URL}/company-news`)
  url.searchParams.set('symbol', symbol)
  url.searchParams.set('from', from.toISOString().slice(0, 10))
  url.searchParams.set('to', now.toISOString().slice(0, 10))
  url.searchParams.set('token', apiKey)

  const payload = await fetchArrayPayload<Record<string, unknown>>(url)
  return payload.data
    .map((row): CompanyNewsItem | null => {
      const headline = typeof row.headline === 'string' ? row.headline.trim() : ''
      if (!headline) {
        return null
      }

      const timestamp =
        typeof row.datetime === 'number' && Number.isFinite(row.datetime)
          ? new Date(row.datetime * 1000).toISOString()
          : undefined

      return {
        title: headline,
        publishedAt: normalizeDate(timestamp),
        source: typeof row.source === 'string' ? row.source : undefined,
        url: typeof row.url === 'string' ? row.url : undefined,
        summary: typeof row.summary === 'string' ? row.summary : undefined,
      }
    })
    .filter((row): row is CompanyNewsItem => row !== null)
    .slice(0, 8)
}

async function getFinnhubCompanyFilings(symbol: string, apiKey: string): Promise<CompanyFilingItem[]> {
  const url = new URL(`${FINNHUB_BASE_URL}/stock/filings`)
  url.searchParams.set('symbol', symbol)
  url.searchParams.set('token', apiKey)

  const payload = await fetchArrayPayload<Record<string, unknown>>(url)
  return payload.data
    .map((row) => ({
      type: typeof row.form === 'string' ? row.form : 'Filing',
      filingDate: normalizeDate(typeof row.filedDate === 'string' ? row.filedDate : undefined),
      acceptedDate: normalizeDate(typeof row.acceptedDate === 'string' ? row.acceptedDate : undefined),
      cik: typeof row.cik === 'string' ? row.cik : undefined,
      finalLink:
        (typeof row.filingUrl === 'string' && row.filingUrl) ||
        (typeof row.reportUrl === 'string' ? row.reportUrl : undefined),
    }))
    .slice(0, 10)
}

export async function getFmpCompanyData(symbol: string): Promise<FmpCompanyData> {
  const apiKey = resolveFmpKey()
  if (!apiKey) {
    return {
      news: [],
      filings: [],
      hasApiKey: false,
      errorMessage: 'FMP API key is not configured.',
    }
  }

  const [news, filings] = await Promise.all([
    getFmpCompanyNews(symbol, apiKey),
    getFmpCompanyFilings(symbol, apiKey),
  ])

  let resolvedNews = news.rows
  let resolvedFilings = filings.rows
  let errorMessage = news.errorMessage || filings.errorMessage

  if ((isFmpAccessRestricted(news.errorMessage) || isFmpAccessRestricted(filings.errorMessage)) &&
    (resolvedNews.length === 0 || resolvedFilings.length === 0)) {
    const finnhubKey = resolveFinnhubKey()
    if (finnhubKey) {
      const [fallbackNews, fallbackFilings] = await Promise.all([
        resolvedNews.length === 0 ? getFinnhubCompanyNews(symbol, finnhubKey) : Promise.resolve(resolvedNews),
        resolvedFilings.length === 0
          ? getFinnhubCompanyFilings(symbol, finnhubKey)
          : Promise.resolve(resolvedFilings),
      ])

      resolvedNews = fallbackNews
      resolvedFilings = fallbackFilings

      if (resolvedNews.length > 0 || resolvedFilings.length > 0) {
        errorMessage = undefined
      }
    }
  }

  return {
    news: resolvedNews,
    filings: resolvedFilings,
    hasApiKey: true,
    errorMessage,
  }
}
