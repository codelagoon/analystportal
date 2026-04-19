import { NextRequest, NextResponse } from 'next/server'
import { getFinancialQuote } from '@/lib/financial-data'

// Disable caching to ensure live, accurate pricing data
export const revalidate = 0

const FMP_API_BASE = 'https://financialmodelingprep.com/api/v3'

// Popular companies database for fallback company name search
const POPULAR_COMPANIES: Array<{ name: string; symbol: string }> = [
  // Technology
  { name: 'Apple', symbol: 'AAPL' },
  { name: 'Microsoft', symbol: 'MSFT' },
  { name: 'Alphabet', symbol: 'GOOGL' },
  { name: 'Google', symbol: 'GOOGL' },
  { name: 'Amazon', symbol: 'AMZN' },
  { name: 'NVIDIA', symbol: 'NVDA' },
  { name: 'Meta', symbol: 'META' },
  { name: 'Tesla', symbol: 'TSLA' },
  { name: 'Broadcom', symbol: 'AVGO' },
  { name: 'Oracle', symbol: 'ORCL' },
  { name: 'IBM', symbol: 'IBM' },
  { name: 'Intel', symbol: 'INTC' },
  { name: 'AMD', symbol: 'AMD' },
  { name: 'Qualcomm', symbol: 'QCOM' },
  { name: 'Cisco', symbol: 'CSCO' },
  { name: 'Salesforce', symbol: 'CRM' },
  // Finance
  { name: 'JPMorgan Chase', symbol: 'JPM' },
  { name: 'Goldman Sachs', symbol: 'GS' },
  { name: 'Morgan Stanley', symbol: 'MS' },
  { name: 'Bank of America', symbol: 'BAC' },
  { name: 'Wells Fargo', symbol: 'WFC' },
  { name: 'Berkshire Hathaway', symbol: 'BRK.B' },
  // Healthcare
  { name: 'Moderna', symbol: 'MRNA' },
  { name: 'Pfizer', symbol: 'PFE' },
  { name: 'Johnson & Johnson', symbol: 'JNJ' },
  { name: 'AbbVie', symbol: 'ABBV' },
  { name: 'Merck', symbol: 'MRK' },
  { name: 'Eli Lilly', symbol: 'LLY' },
  // Retail
  { name: 'Walmart', symbol: 'WMT' },
  { name: 'Target', symbol: 'TGT' },
  { name: 'Costco', symbol: 'COST' },
  // Energy
  { name: 'ExxonMobil', symbol: 'XOM' },
  { name: 'Chevron', symbol: 'CVX' },
]

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')

  if (!query || query.trim().length === 0) {
    return NextResponse.json([])
  }

  const searchQuery = query.trim()

  // First, try as a ticker if it's 1-5 uppercase letters
  if (/^[A-Z]{1,5}$/.test(searchQuery)) {
    try {
      const quote = await getFinancialQuote(searchQuery)
      if (quote && quote.price > 0) {
        return NextResponse.json([
          {
            id: `company-${quote.symbol}`,
            category: 'Companies',
            title: quote.name && quote.name !== quote.symbol ? `${quote.name} (${quote.symbol})` : quote.symbol,
            meta: `${quote.symbol} • $${quote.price.toFixed(2)}${quote.changePercent !== undefined ? ` • ${quote.changePercent > 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%` : ''}`,
            href: `/terminal/company/${quote.symbol}`,
            icon: 'company' as const,
            keywords: [quote.symbol.toLowerCase(), (quote.name || '').toLowerCase()],
            featured: false,
            action: 'route',
          },
        ])
      }
    } catch (error) {
      console.error(`[Search] Failed to fetch ticker ${searchQuery}:`, error)
      // Don't return yet - fall through to company name search
    }
  }

  // Try searching by company name using popular companies fallback
  // (FMP /search endpoint is deprecated and no longer supported)
  try {
    const query = searchQuery.toLowerCase()
    
    // Filter companies by name or symbol match
    const matchedCompanies = POPULAR_COMPANIES.filter(company => 
      company.name.toLowerCase().includes(query) ||
      company.symbol.toLowerCase().includes(query)
    ).slice(0, 5) // Limit to 5 results
    
    if (matchedCompanies.length > 0) {
      // Get quotes for the matched companies
      const resultsWithQuotes = await Promise.all(
        matchedCompanies.map(async (company) => {
          try {
            let quote = null
            try {
              quote = await getFinancialQuote(company.symbol)
            } catch (err) {
              console.warn(`[Search] Could not fetch quote for ${company.symbol}:`, err)
              // Continue without quote
            }
            
            // Return result with or without live quote
            return {
              id: `company-${company.symbol}`,
              category: 'Companies',
              title: `${company.name} (${company.symbol})`,
              meta: quote && quote.price > 0 
                ? `${company.symbol} • $${quote.price.toFixed(2)}${quote.changePercent !== undefined ? ` • ${quote.changePercent > 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%` : ''}`
                : `${company.symbol}`,
              href: `/terminal/company/${company.symbol}`,
              icon: 'company' as const,
              keywords: [company.symbol.toLowerCase(), company.name.toLowerCase()],
              featured: false,
              action: 'route',
            }
          } catch (err) {
            console.error(`[Search] Failed to process company ${company.name}:`, err)
            return null
          }
        })
      )
      
      return NextResponse.json(resultsWithQuotes.filter(r => r !== null))
    }
    
    return NextResponse.json([])
  } catch (error) {
    console.error(`[Search] Failed to search companies for "${searchQuery}":`, error)
    return NextResponse.json([])
  }
}
