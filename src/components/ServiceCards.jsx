import { SERVICES } from '../services.js'
import { formatInt, formatMs, formatPct } from '../format.js'

export default function ServiceCards({ summary }) {
  const byId = Object.fromEntries((summary?.services || []).map((s) => [s.serviceId, s]))
  const threshold = summary?.errorThreshold ?? 15

  return (
    <section className="cards">
      {SERVICES.map((svc) => {
        const s = byId[svc.id]
        if (!s) return <div key={svc.id} className="card service-card skeleton" />
        const hasData = s.totalCalls > 0
        const state = !hasData ? 'idle' : s.unhealthy ? 'danger' : 'ok'
        return (
          <article key={svc.id} className={`card service-card ${state}`} style={{ '--svc': svc.color }}>
            <div className="service-head">
              <div>
                <h2>{svc.name}</h2>
                <code>{svc.className}</code>
              </div>
              <span className={`badge ${state}`}>
                {state === 'idle' ? 'Sin datos' : state === 'danger' ? '⚠ Con problemas' : '● Saludable'}
              </span>
            </div>

            <div className="service-metrics">
              <Metric label="Total de llamadas" value={formatInt(s.totalCalls)} />
              <Metric label="Tasa de éxito" value={hasData ? formatPct(s.successRate) : '—'} />
              <Metric label="Tiempo promedio" value={hasData ? formatMs(s.avgResponseTimeMs) : '—'} />
            </div>

            <div className="rate-bar" title={`Éxito ${formatPct(s.successRate)} · Error ${formatPct(s.errorRate)}`}>
              <span className="ok" style={{ width: `${hasData ? s.successRate : 0}%` }} />
              <span className="err" style={{ width: `${hasData ? s.errorRate : 0}%` }} />
              <span className="threshold" style={{ left: `${100 - threshold}%` }} />
            </div>
            <div className="service-foot">
              <span>
                {formatInt(s.successCount)} OK · {formatInt(s.errorCount)} errores
              </span>
              <span className={s.unhealthy ? 'text-danger' : ''}>
                Error {formatPct(s.errorRate)} {s.unhealthy && `(> ${threshold}%)`}
              </span>
            </div>
          </article>
        )
      })}
    </section>
  )
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span className="metric-value">{value}</span>
      <span className="metric-label">{label}</span>
    </div>
  )
}
