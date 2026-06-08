import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'pix.tips — Receba apoio do seu público via Pix'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{
            background: '#22c55e',
            borderRadius: 12,
            padding: '8px 20px',
            color: 'white',
            fontSize: 18,
            fontWeight: 700,
          }}>
            100% grátis
          </div>
        </div>
        <div style={{ fontSize: 96, fontWeight: 800, color: 'white', letterSpacing: -4 }}>
          pix.tips
        </div>
        <div style={{ fontSize: 32, color: '#9ca3af', marginTop: 16, textAlign: 'center', maxWidth: 700 }}>
          Receba apoio do seu público via Pix
        </div>
        <div style={{ fontSize: 22, color: '#4ade80', marginTop: 32 }}>
          Apenas 2% de comissão • Saque imediato
        </div>
      </div>
    ),
    { ...size }
  )
}
