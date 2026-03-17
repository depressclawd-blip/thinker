import { useState } from 'react'
import Navbar from './components/Navbar'
import './App.css'

const CA = '7F87Qx3iEQmAVAi3E2mkSiMCZXzE1P2uJ31fe1Gkpump'

function App() {
  const [copied, setCopied] = useState(false)

  function copyCA() {
    navigator.clipboard.writeText(CA).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <>
      <Navbar />
      <main>
        <section id="home" className="hero-section">
          <img
            src="/thinkerbanner.jpg"
            alt="THINKER"
            className="hero-banner"
          />
          <p className="hero-tagline">
            The meme token for people who think different.
          </p>
          <button type="button" id="ca" className="btn-ca" onClick={copyCA} title="Copy contract address">
            CA: {CA.slice(0, 4)}...{CA.slice(-4)}
            {copied ? <span className="ca-feedback">Copied!</span> : null}
          </button>
          <div className="hero-links">
            <a href="https://x.com/i/communities/2033967902987374990" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
              <img src="/xlogo.png" alt="X" className="hero-link-logo" width="32" height="32" />
            </a>
            <a href="https://pump.fun/coin/7F87Qx3iEQmAVAi3E2mkSiMCZXzE1P2uJ31fe1Gkpump" target="_blank" rel="noopener noreferrer" aria-label="Pump.fun">
              <img src="/pflogo.png" alt="Pump.fun" className="hero-link-logo" width="32" height="32" />
            </a>
            <a href="https://dexscreener.com/solana/E1W6HgPtbi71vYsSYcigk9j5xmBX9FBQThyCyWUP1f2F" target="_blank" rel="noopener noreferrer" aria-label="DexScreener">
              <img src="/dxlogo.png" alt="DexScreener" className="hero-link-logo" width="32" height="32" />
            </a>
          </div>
        </section>

        <section id="about" className="section">
          <h2>About</h2>
          <p className="section-text">
            $THINK is the community meme token for thinkers. No utility, no
            roadmap—just vibes and the belief that the best ideas start with a
            thought.
          </p>
        </section>

        <section className="section gallery-section">
          <div className="gallery-grid">
            <img src="/singa.jpg" alt="Singa" className="gallery-img" />
            <img src="/macan.jpg" alt="Macan" className="gallery-img" />
            <img src="/pinguin.jpg" alt="Pinguin" className="gallery-img" />
            <img src="/thinkerpfp.jpg" alt="THINKER" className="gallery-img" />
          </div>
        </section>
      </main>
      <footer className="footer">
        <p>© THINKER. Not financial advice.</p>
      </footer>
    </>
  )
}

export default App
