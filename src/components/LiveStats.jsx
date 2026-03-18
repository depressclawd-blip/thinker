import { useState, useEffect } from 'react'
import './LiveStats.css'

const DEXSCREENER_PAIR_URL =
  'https://api.dexscreener.com/latest/dex/pairs/solana/E1W6HgPtbi71vYsSYcigk9j5xmBX9FBQThyCyWUP1f2F'
const REFRESH_MS = 60_000

function formatUsd(value) {
  if (value == null || Number.isNaN(value)) return '—'
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
  if (value >= 1) return `$${value.toFixed(2)}`
  if (value >= 0.0001) return `$${value.toFixed(6)}`
  return `$${value.toExponential(2)}`
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

  async function fetchStats() {
    try {
      setError(null)
      const res = await fetch(DEXSCREENER_PAIR_URL)
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      const pair = json.pair ?? json.pairs?.[0]
      if (pair) setData(pair)
      else setError('No pair data')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, REFRESH_MS)
    return () => clearInterval(interval)
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
          src="https://dexscreener.com/solana/E1W6HgPtbi71vYsSYcigk9j5xmBX9FBQThyCyWUP1f2F?embed=1&chartTheme=dark&chartType=usd&interval=15"
        />
        <p className="live-stats-chart-fallback">
          Chart not loading?{' '}
          <a
            href="https://dexscreener.com/solana/E1W6HgPtbi71vYsSYcigk9j5xmBX9FBQThyCyWUP1f2F"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open chart on DexScreener
          </a>
        </p>
      </div>
      <a
        href="https://dexscreener.com/solana/E1W6HgPtbi71vYsSYcigk9j5xmBX9FBQThyCyWUP1f2F"
        target="_blank"
        rel="noopener noreferrer"
        className="live-stats-link"
      >
        View on DexScreener →
      </a>
    </section>
  )
}
