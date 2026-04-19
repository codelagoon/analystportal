import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  AppShell,
  ChartContainer,
  ComparisonChart,
  KpiCard,
  MiniStat,
  Panel,
  StatusPill,
  TableToolbar,
  Timeline,
} from '@/components/terminal/ui-kit'
import { getFinancialQuote } from '@/lib/financial-data'
import { getFmpCompanyData } from '@/lib/fmp-company-data'
import { sidebarNav } from '@/lib/navigation'

const companyProfiles: Record<string, {
  name: string
  subtitle: string
  summary: string
  marketCap: string
  price: string
  pe: string
  fcfYield: string
  priceTrend: number[]
  revenueTrend: number[]
  valuationItems: { label: string; value: number; display: string; meta: string }[]
  peers: string[]
  news: string[]
}> = {
  NVDA: {
    name: 'NVIDIA',
    subtitle: 'Coverage status: Active • Last research update: Apr 16',
    summary:
      'NVIDIA remains a core AI infrastructure beneficiary with sustained hyperscaler demand, improving software attach, and favorable product cadence into FY27.',
    marketCap: '$2.36T',
    price: '$960.22',
    pe: '36.8x',
    fcfYield: '2.1%',
    priceTrend: [12, 13, 14, 16, 15, 17, 19, 20, 22, 21, 23],
    revenueTrend: [18, 19, 20, 23, 26, 28, 31, 33, 36],
    valuationItems: [
      { label: 'EV/Sales', value: 19.2, display: '19.2x', meta: 'vs 11.4x peer median' },
      { label: 'EV/EBITDA', value: 29.1, display: '29.1x', meta: 'vs 19.8x peer median' },
      { label: 'P/E', value: 36.8, display: '36.8x', meta: 'vs 28.4x peer median' },
    ],
    peers: ['AMD', 'AVGO', 'MRVL', 'TSM'],
    news: [
      'Supplier commentary implies strong Q2 backlog.',
      'Major cloud capex guidance was raised by peer set.',
    ],
  },
  MSFT: {
    name: 'Microsoft',
    subtitle: 'Coverage status: Active • Last research update: Apr 15',
    summary:
      'Microsoft continues to show durable enterprise software demand, stable margins, and accelerating monetization across Copilot workflows.',
    marketCap: '$3.04T',
    price: '$421.03',
    pe: '31.4x',
    fcfYield: '1.8%',
    priceTrend: [11, 12, 12, 13, 14, 15, 16, 18, 19, 20, 21],
    revenueTrend: [16, 16.8, 17.5, 18.2, 18.9, 19.8, 20.7, 21.4, 22.1],
    valuationItems: [
      { label: 'EV/Sales', value: 12.8, display: '12.8x', meta: 'vs 9.4x peer median' },
      { label: 'EV/EBITDA', value: 24.1, display: '24.1x', meta: 'vs 17.9x peer median' },
      { label: 'P/E', value: 31.4, display: '31.4x', meta: 'vs 25.6x peer median' },
    ],
    peers: ['NOW', 'CRM', 'ORCL', 'ADBE'],
    news: [
      'Copilot enterprise attach remains the key monetization debate.',
      'Margin profile remains resilient despite elevated AI capex.',
    ],
  },
  AMD: {
    name: 'Advanced Micro Devices',
    subtitle: 'Coverage status: Active • Last research update: Apr 14',
    summary:
      'AMD is seeing better mix into data center GPUs, but the market is still focused on execution consistency and channel inventory.',
    marketCap: '$324B',
    price: '$178.44',
    pe: '31.2x',
    fcfYield: '1.6%',
    priceTrend: [9, 10, 10, 12, 11, 13, 14, 15, 16, 17, 19],
    revenueTrend: [10, 10.7, 11.2, 12, 12.6, 13.3, 14.1, 15, 15.8],
    valuationItems: [
      { label: 'EV/Sales', value: 11.4, display: '11.4x', meta: 'vs 11.4x peer median' },
      { label: 'EV/EBITDA', value: 22.6, display: '22.6x', meta: 'vs 19.8x peer median' },
      { label: 'P/E', value: 31.2, display: '31.2x', meta: 'vs 28.4x peer median' },
    ],
    peers: ['NVDA', 'AVGO', 'MRVL', 'TSM'],
    news: [
      'Channel checks remain constructive into the next data center ramp.',
      'Execution consistency is still the key model risk.',
    ],
  },
}

function getCompanyProfile(ticker: string) {
  const upperTicker = ticker.toUpperCase()
  const cached = companyProfiles[upperTicker]
  
  // Return hardcoded profile if available
  if (cached) {
    return cached
  }

  // Generate default profile for any other ticker
  return {
    name: upperTicker,
    subtitle: `Coverage status: Research Universe • Last research update: Today`,
    summary: `${upperTicker} is a publicly traded company. Use this research workspace to track fundamentals, valuation, and market sentiment.`,
    marketCap: 'N/A',
    price: 'Loading...',
    pe: 'N/A',
    fcfYield: 'N/A',
    priceTrend: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    revenueTrend: [10, 11, 12, 13, 14, 15, 16, 17, 18],
    valuationItems: [
      { label: 'EV/Sales', value: 0, display: 'N/A', meta: 'Loading from live data' },
      { label: 'EV/EBITDA', value: 0, display: 'N/A', meta: 'Loading from live data' },
      { label: 'P/E', value: 0, display: 'N/A', meta: 'Loading from live data' },
    ],
    peers: [],
    news: [
      'Search for related companies using the global search (Cmd+K).',
      'Add your research notes and tracking to this profile.',
    ],
  }
}

function formatMarketCap(value?: number) {
  if (value === undefined || !Number.isFinite(value)) {
    return null
  }

  const absoluteValue = Math.abs(value)
  if (absoluteValue >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`
  if (absoluteValue >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (absoluteValue >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  return `$${value.toFixed(2)}`
}

// Cache company data for 30 seconds to reduce API calls
export const revalidate = 30

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ ticker: string }>
}) {
  const { ticker } = await params
  const profile = getCompanyProfile(ticker)
  const normalizedTicker = ticker.toUpperCase()
  const [liveQuote, fmpData] = await Promise.all([
    getFinancialQuote(normalizedTicker),
    getFmpCompanyData(normalizedTicker),
  ])

  const price = liveQuote ? `$${liveQuote.price.toFixed(2)}` : profile.price
  const marketCap = formatMarketCap(liveQuote?.marketCap) ?? profile.marketCap
  const pe = liveQuote?.pe ? `${liveQuote.pe.toFixed(1)}x` : profile.pe
  const delta = liveQuote?.changePercent !== undefined
    ? `${liveQuote.changePercent >= 0 ? '+' : ''}${liveQuote.changePercent.toFixed(2)}%`
    : '+3.42%'

  return (
    <AppShell
      nav={sidebarNav}
      title={`Company Research: ${profile.name} (${ticker.toUpperCase()})`}
      subtitle="Use this page to understand the business, compare valuation, and open related research or peers."
      rightRail={
        <>
          <Panel title="What matters most" description="The three items a new analyst should read first.">
            <div className="space-y-2">
              <MiniStat label="Stance" value="Outperform" />
              <MiniStat label="Conviction" value="8.4 / 10" />
              <MiniStat label="Focus item" value="Execution and supply chain concentration" />
            </div>
            <div className="mt-3">
              <StatusPill label={liveQuote ? 'Live Quote' : 'Static Fallback'} />
            </div>
          </Panel>
          <Panel title="Recent notes" description="Short internal updates that explain what changed.">
            <div className="space-y-2 text-sm">
              {fmpData.news.length > 0
                ? fmpData.news.slice(0, 3).map((item) => (
                    <div key={`${item.title}-${item.publishedAt}`} className="rounded-md border border-zinc-800 bg-zinc-900/70 p-2.5">
                      <p className="text-zinc-100">{item.title}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {item.publishedAt}
                        {item.source ? ` • ${item.source}` : ''}
                      </p>
                    </div>
                  ))
                : profile.news.map((item) => (
                    <div key={item} className="rounded-md border border-zinc-800 bg-zinc-900/70 p-2.5">
                      {item}
                    </div>
                  ))}
            </div>
          </Panel>
        </>
      }
    >
      <TableToolbar />

      <Panel title="How to use this company page" description="Read the summary, check the charts, then open a peer or research note if you need more context.">
        <div className="flex flex-wrap gap-2 text-sm text-zinc-300">
          <StatusPill label="Business summary first" />
          <StatusPill label="Then charts and valuation" />
          <StatusPill label="Open related research or peers" />
        </div>
      </Panel>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Price" value={price} delta={delta} />
        <KpiCard label="Market Cap" value={marketCap} delta={liveQuote ? 'Live quote' : '+1.3% WoW'} />
        <KpiCard label="NTM P/E" value={pe} delta={liveQuote ? 'Live quote' : '-0.7x'} />
        <KpiCard label="FCF Yield" value={profile.fcfYield} delta="+0.2%" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Price Chart" description="1M, 3M, 1Y framing" className="xl:col-span-2">
          <ChartContainer title="Price Action" points={profile.priceTrend} />
        </Panel>

        <Panel title="Company Summary" description="Internal synopsis">
          <p className="text-sm text-zinc-300">{profile.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusPill label="Core Coverage" />
            <StatusPill label="High Priority" />
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Financial metrics" description="The basic operating facts before you read the thesis.">
          <div className="grid gap-2 md:grid-cols-2">
            <MiniStat label="Rev CAGR (3Y)" value="41.2%" />
            <MiniStat label="Gross Margin" value="73.1%" />
            <MiniStat label="ROIC" value="34.8%" />
            <MiniStat label="Net Debt / EBITDA" value="(0.4)x" />
          </div>
          <div className="mt-4">
            <ChartContainer title="Revenue Trend" points={profile.revenueTrend} />
          </div>
        </Panel>

        <Panel title="Valuation snapshot" description="Compare the company to peers before making a conclusion.">
          <ComparisonChart title="Peer Multiple Gap" items={profile.valuationItems} />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel
          title="Market Filings and Data Search"
          description="Recent SEC filings and quick links to primary company data tools."
        >
          <div className="mb-3 flex flex-wrap gap-2 text-xs text-zinc-400">
            <StatusPill label={fmpData.hasApiKey ? 'FMP Connected' : 'FMP API Key Needed'} />
            <StatusPill label={`Ticker: ${normalizedTicker}`} />
          </div>

          <div className="space-y-2 text-sm">
            {fmpData.filings.length > 0 ? (
              fmpData.filings.slice(0, 5).map((filing) => (
                <div key={`${filing.type}-${filing.filingDate}-${filing.finalLink ?? ''}`} className="rounded border border-zinc-800 bg-zinc-900/70 px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-zinc-100">{filing.type}</p>
                    <p className="text-xs text-zinc-500">{filing.filingDate}</p>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Accepted: {filing.acceptedDate ?? 'n/a'}
                    {filing.cik ? ` • CIK ${filing.cik}` : ''}
                  </p>
                  {filing.finalLink ? (
                    <a
                      className="mt-2 inline-block text-xs text-sky-300 underline-offset-2 hover:underline"
                      href={filing.finalLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open filing
                    </a>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="rounded-md border border-zinc-800 bg-zinc-900/80 p-2.5 text-xs text-zinc-500">
                {fmpData.hasApiKey
                  ? fmpData.errorMessage ?? 'No filing records were returned for this ticker yet.'
                  : 'Add FMP_API_KEY in .env.local to load live filing search data.'}
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`https://www.sec.gov/edgar/search/#/q=${normalizedTicker}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button size="xs" variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-200">
                Search SEC filings
              </Button>
            </a>
            <a
              href={`https://site.financialmodelingprep.com/developer/docs/stable/company-news?symbol=${normalizedTicker}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button size="xs" variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-200">
                Company data docs
              </Button>
            </a>
          </div>
        </Panel>

        <Panel title="Company News (FMP)" description="Latest market headlines tied to this ticker.">
          <div className="space-y-2 text-sm">
            {fmpData.news.length > 0 ? (
              fmpData.news.slice(0, 6).map((item) => (
                <div key={`${item.title}-${item.publishedAt}-${item.url ?? ''}`} className="rounded border border-zinc-800 bg-zinc-900/70 px-3 py-2">
                  <p className="font-medium text-zinc-100">{item.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {item.publishedAt}
                    {item.source ? ` • ${item.source}` : ''}
                  </p>
                  {item.summary ? <p className="mt-1 text-xs text-zinc-400">{item.summary}</p> : null}
                  {item.url ? (
                    <a
                      className="mt-2 inline-block text-xs text-sky-300 underline-offset-2 hover:underline"
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open article
                    </a>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="rounded-md border border-zinc-800 bg-zinc-900/80 p-2.5 text-xs text-zinc-500">
                {fmpData.hasApiKey
                  ? fmpData.errorMessage ?? 'No live news returned for this ticker yet.'
                  : 'Add FMP_API_KEY in .env.local to load live company news.'}
              </p>
            )}
          </div>
        </Panel>

        <Panel title="Peer companies" description="Open a peer to compare the same metrics in context.">
          <div className="space-y-2 text-sm">
            {profile.peers.map((peer) => (
              <div key={peer} className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/70 px-3 py-2">
                <span className="text-zinc-100">{peer}</span>
                <Link href={`/terminal/company/${peer}`}>
                  <Button size="xs" variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-200">
                    Open
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Related research" description="Recent research and notes connected to this company.">
          <Timeline
            entries={[
              { title: 'AI Infrastructure Capex', detail: 'Published by M. Tran', at: 'Apr 16' },
              { title: 'Margin Structure Deep Dive', detail: 'Under review by D. Alvarez', at: 'Apr 12' },
              { title: 'Supplier Risk Matrix', detail: 'Draft by L. Shah', at: 'Apr 10' },
            ]}
          />
        </Panel>
      </div>
    </AppShell>
  )
}
