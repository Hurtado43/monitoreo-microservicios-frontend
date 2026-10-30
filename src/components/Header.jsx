import { useEffect, useState } from 'react'
import { formatInt, formatMs, formatPct } from '../format.js'

function useSecondsSince(date) {
  const [, tick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])
  return date ? Math.max(0, Math.round((Date.now() - date.getTime()) / 1000)) : null
}

export default function Header({ summary, connection, lastUpdated, live, onToggleLive, simulating, onSimulate }) {
  const seconds = useSecondsSince(lastUpdated)
  const online = connection === 'online'
  const globalUnhealthy = summary && summary.errorRate > summary.errorThreshold

  return (
    <header className="header">
      <div className="header-top">
        <div className="brand">
          <div className="logo" aria-hidden>
            <svg viewBox="0 0 32 32"><path d="M5 18h5l3-8 5 14 3-6h6" /></svg>
          </div>
          <div>
            <h1>Monitor de Microservicios</h1>
            <p>Proxy de auditoría y logging · Inventario, Pedidos y Pagos</p>
          </div>
        </div>

        <div className="header-actions">
          <div className={`live-indicator ${online ? (live ? 'on' : 'paused') : connection === 'offline' ? 'off' : ''}`}>
            <span className="dot" />
            {online
              ? live
                ? `En vivo · hace ${seconds ?? 0}s`
                : 'Pausado'
              : connection === 'offline'
                ? 'Sin conexión'
                : 'Conectando…'}
          </div>
          <button className="btn ghost" onClick={onToggleLive} title="Pausar o reanudar el polling cada 3 s">
            {live ? 'Pausar' : 'Reanudar'}
          </button>
          <button className="btn primary" onClick={onSimulate} disabled={simulating || !online}>
            {simulating ? (
              <>
                <span className="spinner small" /> Simulando…
              </>
            ) : (
              <>⚡ Simular carga</>
            )}
          </button>
        </div>
      </div>

      <div className="kpis">
        <Kpi label="Llamadas totales" value={summary ? formatInt(summary.totalCalls) : '—'} />
        <Kpi
          label="Tasa de error global"
          value={summary ? formatPct(summary.errorRate) : '—'}
          tone={globalUnhealthy ? 'danger' : undefined}
        />
        <Kpi label="Tiempo promedio" value={summary ? formatMs(summary.avgResponseTimeMs) : '—'} />
        <Kpi
          label="Servicios con problemas"
          value={summary ? `${summary.services.filter((s) => s.unhealthy).length} / ${summary.services.length}` : '—'}
          tone={summary?.services.some((s) => s.unhealthy) ? 'danger' : undefined}
        />
      </div>
    </header>
  )
}

function Kpi({ label, value, tone }) {
  return (
    <div className={`kpi ${tone || ''}`}>
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{value}</span>
    </div>
  )
}
