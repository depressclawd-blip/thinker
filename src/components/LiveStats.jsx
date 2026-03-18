import { useState, useEffect } from 'react'
import './LiveStats.css'

/** Token mint; after migration, stats use the highest-liquidity pool (e.g. PumpSwap). */
const TOKEN_CA = '7F87Qx3iEQmAVAi3E2mkSiMCZXzE1P2uJ31fe1Gkpump'
const DEXSCREENER_TOKEN_PAIRS_URL = `https://api.dexscreener.com/token-pairs/v1/solana/${TOKEN_CA}`
/** DexScreener token page (not the old bonding pair). */
const DEXSCREENER_PAGE = `https://dexscreener.com/solana/${TOKEN_CA.toLowerCase()}`
const REFRESH_MS = 15_000

function pickMainPair(pairs) {
  if (!Array.isArray(pairs) || pairs.length === 0) return null
  return pairs.reduce((best, p) => {
    const liq = p.liquidity?.usd ?? 0
    const bestLiq = best.liquidity?.usd ?? 0
    return liq > bestLiq ? p : best
  })
}

function formatUsd(value) {
  if (value == null || Number.isNaN(value)) return '—'
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
  if (value >= 1) return `$${value.toFixed(2)}`
  if (value >= 0.0001) return `$${value.toFixed(6)}`
  if (value > 0) return `$${value.toFixed(8)}`
  return '—'
}

function formatTime(d) {
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatPercent(value) {
  if (value == null || Number.isNaN(value)) return '—'
  const n = Number(value)
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

export default function LiveStats() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  async function fetchStats() {
    try {
      setError(null)
      const res = await fetch(DEXSCREENER_TOKEN_PAIRS_URL, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to fetch')
      const pairs = await res.json()
      const pair = pickMainPair(pairs)
      if (pair) {
        setData(pair)
        setLastUpdated(new Date())
      } else setError('No pair data')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, REFRESH_MS)
    const onFocus = () => fetchStats()
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  if (loading && !data) {
    return (
      <section className="live-stats">
        <p className="live-stats-loading">Loading live stats…</p>
      </section>
    )
  }

  if (error && !data) {
    return (
      <section className="live-stats">
        <p className="live-stats-error">Stats unavailable</p>
      </section>
    )
  }

  const priceUsd = data?.priceUsd != null ? parseFloat(data.priceUsd) : null
  const rawChange = data?.priceChange?.h24
  const priceChange24 =
    rawChange != null
      ? Math.abs(Number(rawChange)) > 100
        ? Number(rawChange) / 100
        : Number(rawChange)
      : null
  const volume24 = data?.volume?.h24 != null ? Number(data.volume.h24) : null
  const fdv = data?.fdv != null ? Number(data.fdv) : null

  return (
    <section className="live-stats" aria-label="Live token stats">
      <h2 className="live-stats-title">Live stats</h2>
      {lastUpdated ? (
        <p className="live-stats-updated">
          Updated {formatTime(lastUpdated)} · refresh every 15s
        </p>
      ) : null}
      <div className="live-stats-grid">
        <div className="live-stat">
          <span className="live-stat-label">Price</span>
          <span className="live-stat-value">{formatUsd(priceUsd)}</span>
        </div>
        <div className="live-stat">
          <span className="live-stat-label">24h %</span>
          <span
            className={`live-stat-value ${priceChange24 != null && priceChange24 >= 0 ? 'live-stat-up' : 'live-stat-down'}`}
          >
            {formatPercent(priceChange24)}
          </span>
        </div>
        <div className="live-stat">
          <span className="live-stat-label">Vol 24h</span>
          <span className="live-stat-value">{formatUsd(volume24)}</span>
        </div>
        <div className="live-stat">
          <span className="live-stat-label">FDV</span>
          <span className="live-stat-value">{formatUsd(fdv)}</span>
        </div>
      </div>
      <div className="live-stats-chart-wrap">
        <p className="live-stats-chart-label">Price chart</p>
        <iframe
          title="THINKER price chart on DexScreener"
          className="live-stats-chart"
          src={`${DEXSCREENER_PAGE}?embed=1&chartTheme=dark&chartType=usd&interval=15`}
        />
        <p className="live-stats-chart-fallback">
          Chart not loading?{' '}
          <a
            href={DEXSCREENER_PAGE}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open chart on DexScreener
          </a>
        </p>
      </div>
      <a
        href={DEXSCREENER_PAGE}
        target="_blank"
        rel="noopener noreferrer"
        className="live-stats-link"
      >
        View on DexScreener →
      </a>
    </section>
  )
}
