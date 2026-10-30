import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { SERVICES, serviceById } from '../services.js'
import { formatTime } from '../format.js'

const ERROR_COLOR = '#ef4444'

/** Une las ultimas 20 llamadas de cada servicio en filas: x = posicion (1 = la mas antigua). */
function buildRows(recent) {
  const rows = Array.from({ length: 20 }, (_, i) => ({ idx: i + 1 }))
  for (const svc of SERVICES) {
    const calls = [...(recent[svc.id] || [])].reverse()
    const offset = 20 - calls.length
    calls.forEach((log, i) => {
      rows[offset + i][svc.id] = log.durationMs
      rows[offset + i][`${svc.id}Log`] = log
    })
  }
  return rows
}

export default function ResponseChart({ recent }) {
  const [hidden, setHidden] = useState({})
  const rows = useMemo(() => buildRows(recent), [recent])
  const empty = SERVICES.every((s) => !(recent[s.id] || []).length)

  return (
    <section className="card chart-card">
      <div className="card-title">
        <div>
          <h3>Tiempo de respuesta</h3>
          <p>Últimas 20 llamadas por servicio · los puntos rojos son errores</p>
        </div>
        <div className="legend">
          {SERVICES.map((s) => (
            <button
              key={s.id}
              className={`legend-item ${hidden[s.id] ? 'off' : ''}`}
              onClick={() => setHidden((h) => ({ ...h, [s.id]: !h[s.id] }))}
              style={{ '--svc': s.color }}
            >
              <span className="swatch" /> {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-wrap">
        {empty ? (
          <div className="empty">Aún no hay llamadas. Pulsa «Simular carga» para generar datos.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 10, right: 16, bottom: 0, left: -8 }}>
              <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="idx" stroke="var(--muted)" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis stroke="var(--muted)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} unit=" ms" width={64} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border-strong)' }} />
              {SERVICES.map((s) => (
                <Line
                  key={s.id}
                  type="monotone"
                  dataKey={s.id}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={2}
                  hide={!!hidden[s.id]}
                  connectNulls
                  isAnimationActive={false}
                  dot={(props) => <StatusDot key={`${s.id}-${props.index}`} {...props} serviceId={s.id} color={s.color} />}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}

function StatusDot({ cx, cy, payload, serviceId, color }) {
  const log = payload?.[`${serviceId}Log`]
  if (!log || cx == null || cy == null) return null
  const isError = log.status === 'ERROR'
  return (
    <circle
      cx={cx}
      cy={cy}
      r={isError ? 4.5 : 2.5}
      fill={isError ? ERROR_COLOR : color}
      stroke={isError ? '#fff' : 'none'}
      strokeWidth={isError ? 1.5 : 0}
    />
  )
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="chart-tooltip">
      <div className="tt-title">Llamada #{row.idx}</div>
      {payload.map((p) => {
        const log = row[`${p.dataKey}Log`]
        if (!log) return null
        return (
          <div key={p.dataKey} className="tt-row">
            <span className="swatch" style={{ background: serviceById[p.dataKey].color }} />
            <span className="tt-op">{log.operation}</span>
            <strong>{log.durationMs} ms</strong>
            <span className={`pill ${log.status === 'SUCCESS' ? 'ok' : 'err'}`}>{log.status}</span>
            <span className="tt-time">{formatTime(log.timestamp)}</span>
          </div>
        )
      })}
    </div>
  )
}
