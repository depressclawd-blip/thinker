/**
 * THINKER Meme Generator (standalone component).
 * Wire up in App.jsx: import MemeGenerator + <MemeGenerator />
 * Navbar: <a href="#meme">Meme</a>
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import './MemeGenerator.css'

const MAX_W = 720
const PADDING = 16
const LOGO_SIZE = 72

function wrapLines(ctx, text, maxWidth) {
  if (!text.trim()) return []
  const words = text.split(/\s+/)
  const lines = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function drawOutlinedText(ctx, lines, x, y, lineHeight, fontSize, isBottom) {
  ctx.font = `bold ${fontSize}px Impact, "Arial Black", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = isBottom ? 'bottom' : 'top'
  ctx.lineWidth = Math.max(3, fontSize / 12)
  ctx.strokeStyle = '#000'
  ctx.fillStyle = '#fff'
  lines.forEach((ln, i) => {
    const ly = isBottom ? y - (lines.length - 1 - i) * lineHeight : y + i * lineHeight
    ctx.strokeText(ln, x, ly)
    ctx.fillText(ln, x, ly)
  })
}

export default function MemeGenerator() {
  const canvasRef = useRef(null)
  const imgRef = useRef(null)
  const logoRef = useRef(null)
  const [topText, setTopText] = useState('WHEN YOU')
  const [bottomText, setBottomText] = useState('THINK DIFFERENT')
  const [showLogo, setShowLogo] = useState(true)
  const [hasImage, setHasImage] = useState(false)
  const [redrawKey, setRedrawKey] = useState(0)

  const onFile = (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      if (imgRef.current?.src?.startsWith('blob:')) {
        URL.revokeObjectURL(imgRef.current.src)
      }
      imgRef.current = img
      setHasImage(true)
      setRedrawKey((k) => k + 1)
    }
    img.src = url
  }

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const img = imgRef.current

    if (!img || !img.complete || !img.naturalWidth) {
      canvas.width = MAX_W
      canvas.height = 400
      ctx.fillStyle = '#1a1a22'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#666'
      ctx.font = '18px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Upload an image ↑', canvas.width / 2, canvas.height / 2)
      return
    }

    const ratio = img.naturalHeight / img.naturalWidth
    const w = Math.min(MAX_W, img.naturalWidth)
    const h = Math.round(w * ratio)
    canvas.width = w
    canvas.height = h
    ctx.drawImage(img, 0, 0, w, h)

    const maxTextW = w - PADDING * 2
    const fontSize = Math.min(48, Math.max(22, Math.floor(w / 14)))
    ctx.font = `bold ${fontSize}px Impact, "Arial Black", sans-serif`
    const topLines = wrapLines(ctx, topText, maxTextW)
    const botLines = wrapLines(ctx, bottomText, maxTextW)
    const lh = fontSize + 8
    if (topLines.length) {
      drawOutlinedText(ctx, topLines, w / 2, PADDING, lh, fontSize, false)
    }
    if (botLines.length) {
      drawOutlinedText(ctx, botLines, w / 2, h - PADDING, lh, fontSize, true)
    }

    if (showLogo && logoRef.current?.complete && logoRef.current.naturalWidth) {
      const lg = logoRef.current
      const s = LOGO_SIZE
      const lx = w - s - 10
      const ly = h - s - 10
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(lx - 4, ly - 4, s + 8, s + 8)
      ctx.drawImage(lg, lx, ly, s, s)
    }
  }, [topText, bottomText, showLogo, redrawKey])

  useEffect(() => {
    redraw()
  }, [redraw])

  useEffect(() => {
    const logo = new Image()
    logo.crossOrigin = 'anonymous'
    logo.onload = () => {
      logoRef.current = logo
      setRedrawKey((k) => k + 1)
    }
    logo.onerror = () => {
      logoRef.current = null
    }
    logo.src = '/thinkerpfp.jpg'
  }, [])

  function downloadPng() {
    const canvas = canvasRef.current
    if (!canvas || !hasImage) return
    const a = document.createElement('a')
    a.download = 'thinker-meme.png'
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  return (
    <section id="meme" className="meme-section">
      <h2 className="meme-title">Meme generator</h2>
      <p className="meme-intro">
        Upload a photo, add top and bottom text, then download a PNG. Everything runs in your browser—nothing is uploaded to our servers.
      </p>

      <div className="meme-layout">
        <div className="meme-controls">
          <label className="meme-label">
            <span>Image</span>
            <input type="file" accept="image/*" onChange={onFile} className="meme-file" />
          </label>
          <label className="meme-label">
            <span>Top text</span>
            <input
              type="text"
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
              placeholder="Top text"
              className="meme-input"
            />
          </label>
          <label className="meme-label">
            <span>Bottom text</span>
            <input
              type="text"
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
              placeholder="Bottom text"
              className="meme-input"
            />
          </label>
          <label className="meme-check">
            <input type="checkbox" checked={showLogo} onChange={(e) => setShowLogo(e.target.checked)} />
            Show THINKER logo (corner)
          </label>
          <button type="button" className="meme-download" onClick={downloadPng} disabled={!hasImage}>
            Download PNG
          </button>
        </div>
        <div className="meme-preview-wrap">
          <canvas ref={canvasRef} className="meme-canvas" />
        </div>
      </div>
    </section>
  )
}
