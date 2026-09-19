import { useState, useRef, useCallback } from 'react'

const ANIMAL_EMOJIS = {
  antelope: '🦌', badger: '🦡', bat: '🦇', bear: '🐻', bee: '🐝',
  beetle: '🪲', bison: '🦬', boar: '🐗', butterfly: '🦋', cat: '🐱',
  caterpillar: '🐛', chimpanzee: '🐒', cockroach: '🪳', cow: '🐄', coyote: '🐺',
  crab: '🦀', crow: '🐦', deer: '🦌', dog: '🐶', dolphin: '🐬',
  donkey: '🫏', dragonfly: '🪲', duck: '🦆', eagle: '🦅', elephant: '🐘',
  flamingo: '🦩', fly: '🪰', fox: '🦊', goat: '🐐', goldfish: '🐟',
  goose: '🪿', gorilla: '🦍', grasshopper: '🦗', hamster: '🐹', hare: '🐇',
  hedgehog: '🦔', hippopotamus: '🦛', hornbill: '🐦', horse: '🐴', hummingbird: '🐦',
  hyena: '🐾', jellyfish: '🪼', kangaroo: '🦘', koala: '🐨', ladybugs: '🐞',
  leopard: '🐆', lion: '🦁', lizard: '🦎', lobster: '🦞', mosquito: '🦟',
  moth: '🦋', mouse: '🐭', octopus: '🐙', okapi: '🦒', orangutan: '🦧',
  otter: '🦦', owl: '🦉', ox: '🐂', oyster: '🦪', panda: '🐼',
  parrot: '🦜', pelecaniformes: '🐦', penguin: '🐧', pig: '🐷', pigeon: '🐦',
  porcupine: '🐾', possum: '🐾', raccoon: '🦝', rat: '🐀', reindeer: '🦌',
  rhinoceros: '🦏', sandpiper: '🐦', seahorse: '🐠', seal: '🦭', shark: '🦈',
  sheep: '🐑', snake: '🐍', sparrow: '🐦', squid: '🦑', squirrel: '🐿️',
  starfish: '⭐', swan: '🦢', tiger: '🐯', turkey: '🦃', turtle: '🐢',
  whale: '🐋', wolf: '🐺', wombat: '🐾', woodpecker: '🐦', zebra: '🦓',
}

function ConfidenceBar({ label, confidence, isTop }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
        <span style={{ textTransform: 'capitalize', fontWeight: isTop ? 700 : 400, color: isTop ? '#a78bfa' : '#94a3b8' }}>
          {ANIMAL_EMOJIS[label] || '🐾'} {label}
        </span>
        <span style={{ color: isTop ? '#a78bfa' : '#64748b', fontWeight: isTop ? 700 : 400 }}>
          {confidence.toFixed(1)}%
        </span>
      </div>
      <div style={{ background: '#1e293b', borderRadius: 6, height: 8, overflow: 'hidden' }}>
        <div style={{
          width: `${confidence}%`,
          height: '100%',
          background: isTop
            ? 'linear-gradient(90deg, #7c3aed, #a78bfa)'
            : 'linear-gradient(90deg, #334155, #475569)',
          borderRadius: 6,
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
}

export default function App() {
  const [image, setImage] = useState(null)      // preview URL
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) {
      setError('Please upload a valid image file.')
      return
    }
    setFile(f)
    setImage(URL.createObjectURL(f))
    setResult(null)
    setError(null)
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    handleFile(f)
  }, [])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const classify = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('http://localhost:8000/predict', { method: 'POST', body: form })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Server error')
      }
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError(e.message === 'Failed to fetch'
        ? 'Cannot reach backend. Make sure uvicorn is running on port 8000.'
        : e.message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setImage(null); setFile(null); setResult(null); setError(null)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>🐾</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Animal Classifier
        </h1>
        <p style={{ color: '#64748b', marginTop: 6, fontSize: 14 }}>
          Identify 90 animal species using MobileNetV2 deep learning
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: 560 }}>
        {/* Drop zone */}
        {!image ? (
          <div
            onClick={() => inputRef.current.click()}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            style={{
              border: `2px dashed ${dragging ? '#a78bfa' : '#334155'}`,
              borderRadius: 16,
              padding: '56px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragging ? 'rgba(167,139,250,0.05)' : '#161b27',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
            <p style={{ color: '#94a3b8', fontSize: 15 }}>
              Drag & drop an animal image here, or <span style={{ color: '#a78bfa', fontWeight: 600 }}>browse</span>
            </p>
            <p style={{ color: '#475569', fontSize: 12, marginTop: 6 }}>JPG, PNG, WEBP supported</p>
            <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0])} />
          </div>
        ) : (
          <div style={{ background: '#161b27', borderRadius: 16, overflow: 'hidden', border: '1px solid #1e293b' }}>
            {/* Image preview */}
            <div style={{ position: 'relative', background: '#0d1117' }}>
              <img
                src={image}
                alt="preview"
                style={{ width: '100%', maxHeight: 320, objectFit: 'contain', display: 'block' }}
              />
              <button
                onClick={reset}
                style={{
                  position: 'absolute', top: 10, right: 10,
                  background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: 8,
                  color: '#94a3b8', cursor: 'pointer', padding: '4px 10px', fontSize: 13,
                }}
              >✕ Clear</button>
            </div>

            {/* Result */}
            <div style={{ padding: '20px 24px' }}>
              {!result && !loading && !error && (
                <button
                  onClick={classify}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseOver={e => e.target.style.opacity = 0.88}
                  onMouseOut={e => e.target.style.opacity = 1}
                >
                  🔍 Classify Animal
                </button>
              )}

              {loading && (
                <div style={{ textAlign: 'center', padding: '16px 0', color: '#a78bfa' }}>
                  <div style={{ fontSize: 28, marginBottom: 8, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
                  <p style={{ fontSize: 14 }}>Analyzing image...</p>
                </div>
              )}

              {error && (
                <div style={{ background: '#3f1212', border: '1px solid #7f1d1d', borderRadius: 10, padding: 16, color: '#fca5a5', fontSize: 14 }}>
                  ⚠️ {error}
                  <div style={{ marginTop: 10 }}>
                    <button onClick={classify} style={{ background: 'transparent', border: '1px solid #fca5a5', color: '#fca5a5', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 13 }}>Retry</button>
                  </div>
                </div>
              )}

              {result && (
                <div>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.1))',
                    border: '1px solid rgba(167,139,250,0.3)',
                    borderRadius: 12, padding: '18px 20px', marginBottom: 20, textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 48, marginBottom: 6 }}>{ANIMAL_EMOJIS[result.prediction] || '🐾'}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, textTransform: 'capitalize', color: '#e2e8f0' }}>
                      {result.prediction}
                    </div>
                    <div style={{ color: '#a78bfa', fontSize: 14, marginTop: 4 }}>
                      {result.confidence.toFixed(1)}% confidence
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: '#475569', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Top 5 Predictions</p>
                  {result.top5.map((item, i) => (
                    <ConfidenceBar key={item.label} label={item.label} confidence={item.confidence} isTop={i === 0} />
                  ))}

                  <button
                    onClick={reset}
                    style={{
                      width: '100%', marginTop: 16, padding: '11px', borderRadius: 10,
                      border: '1px solid #334155', background: 'transparent',
                      color: '#94a3b8', fontSize: 14, cursor: 'pointer',
                    }}
                  >
                    Try another image
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <p style={{ color: '#1e293b', fontSize: 11, marginTop: 40 }}>
        Powered by MobileNetV2 · 90 animal classes
      </p>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
