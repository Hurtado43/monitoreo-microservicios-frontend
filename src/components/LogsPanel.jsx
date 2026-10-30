import { Fragment, useEffect, useRef, useState } from 'react'
import { SERVICES, serviceById } from '../services.js'
import { formatDateTime, formatInt, formatTime, json } from '../format.js'

const MAX_BAR_MS = 500

export default function LogsPanel({ logsPage, filters, onFiltersChange, onReset, page, onPageChange, size, onSizeChange, live }) {
  const [expanded, setExpanded] = useState(null)
  const seen = useRef(null)
  const logs = logsPage?.content || []

  // Resalta las filas que llegan en cada polling (no en la primera carga).
  const newIds = new Set()
  if (seen.current) logs.forEach((l) => !seen.current.has(l.requestId) && newIds.add(l.requestId))
  useEffect(() => {
    if (!logsPage) return
    seen.current = seen.current || new Set()
    logs.forEach((l) => seen.current.add(l.requestId))
  })

  const set = (key) => (e) => {
    const value = e.target.value
    onFiltersChange((f) => ({ ...f, [key]: value }))
  }
  const hasFilters = Object.values(filters).some(Boolean)
  const totalPages = Math.max(1, logsPage?.totalPages || 1)

  return (
    <section className="card logs-card">
      <div className="card-title">
        <div>
          <h3>Logs en tiempo real</h3>
          <p>
            {live ? 'Actualizando cada 3 segundos' : 'Actualización pausada'} · haz clic en una fila para ver el detalle
          </p>
        </div>
        <span className="count">{logsPage ? `${formatInt(logsPage.totalElements)} registros` : ''}</span>
      </div>

      <div className="filters">
        <label>
          Servicio
          <select value={filters.service} onChange={set('service')}>
            <option value="">Todos</option>
            {SERVICES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Estado
          <select value={filters.status} onChange={set('status')}>
            <option value="">Todos</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="ERROR">ERROR</option>
          </select>
        </label>
        <label>
          Desde
          <input type="datetime-local" step="1" value={filters.from} onChange={set('from')} max={filters.to || undefined} />
        </label>
        <label>
          Hasta
          <input type="datetime-local" step="1" value={filters.to} onChange={set('to')} min={filters.from || undefined} />
        </label>
        <button className="btn ghost" onClick={onReset} disabled={!hasFilters}>
          Limpiar filtros
        </button>
      </div>

      <div className="table-wrap">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Hora</th>
              <th>Request ID</th>
              <th>Servicio</th>
              <th>Operación</th>
              <th>Duración</th>
              <th>Estado</th>
              <th aria-label="Expandir" />
            </tr>
          </thead>
          <tbody>
            {!logsPage &&
              Array.from({ length: 5 }, (_, i) => (
                <tr key={i} className="row-skeleton">
                  <td colSpan={7}>
                    <span />
                  </td>
                </tr>
              ))}
            {logsPage && logs.length === 0 && (
              <tr>
                <td colSpan={7} className="empty">
                  {hasFilters ? 'No hay logs que coincidan con los filtros.' : 'Todavía no hay logs. Pulsa «Simular carga».'}
                </td>
              </tr>
            )}
            {logs.map((log) => {
              const svc = serviceById[log.serviceId]
              const open = expanded === log.requestId
              return (
                <Fragment key={log.requestId}>
                  <tr
                    className={`log-row ${open ? 'open' : ''} ${newIds.has(log.requestId) ? 'row-new' : ''} ${log.status === 'ERROR' ? 'row-error' : ''}`}
                    onClick={() => setExpanded(open ? null : log.requestId)}
                  >
                    <td className="mono muted" title={formatDateTime(log.timestamp)}>
                      {formatTime(log.timestamp)}
                    </td>
                    <td className="mono" title={log.requestId}>
                      {log.requestId.slice(0, 8)}…
                    </td>
                    <td>
                      <span className="svc-tag" style={{ '--svc': svc?.color }}>
                        {svc?.name || log.serviceId}
                      </span>
                    </td>
                    <td className="mono">{log.operation}</td>
                    <td>
                      <div className="duration">
                        <span className="mono">{log.durationMs} ms</span>
                        <span className="duration-bar">
                          <span style={{ width: `${Math.min(100, (log.durationMs / MAX_BAR_MS) * 100)}%` }} />
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`pill ${log.status === 'SUCCESS' ? 'ok' : 'err'}`}>{log.status}</span>
                    </td>
                    <td className="chevron">{open ? '▾' : '▸'}</td>
                  </tr>
                  {open && (
                    <tr className="detail-row">
                      <td colSpan={7}>
                        <LogDetail log={log} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <label>
          Filas
          <select value={size} onChange={(e) => onSizeChange(Number(e.target.value))}>
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <div className="pager">
          <button className="btn ghost" onClick={() => onPageChange(0)} disabled={page === 0}>
            «
          </button>
          <button className="btn ghost" onClick={() => onPageChange(page - 1)} disabled={page === 0}>
            Anterior
          </button>
          <span>
            Página {Math.min(page + 1, totalPages)} de {totalPages}
          </span>
          <button className="btn ghost" onClick={() => onPageChange(page + 1)} disabled={page + 1 >= totalPages}>
            Siguiente
          </button>
          <button className="btn ghost" onClick={() => onPageChange(totalPages - 1)} disabled={page + 1 >= totalPages}>
            »
          </button>
        </div>
      </div>
    </section>
  )
}

function LogDetail({ log }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(log.requestId)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* el portapapeles puede no estar disponible */
    }
  }

  return (
    <div className="log-detail">
      <div className="detail-meta">
        <div>
          <span className="label">Request ID</span>
          <span className="mono">{log.requestId}</span>
          <button className="btn tiny" onClick={copy}>
            {copied ? 'Copiado ✓' : 'Copiar'}
          </button>
        </div>
        <div>
          <span className="label">Timestamp</span>
          <span className="mono">{log.timestamp}</span>
        </div>
        <div>
          <span className="label">Llamada</span>
          <span className="mono">
            {serviceById[log.serviceId]?.className}.execute("{log.operation}", …)
          </span>
        </div>
      </div>
      <div className="detail-grid">
        <div>
          <span className="label">Parámetros de entrada</span>
          <pre>{json(log.params)}</pre>
        </div>
        {log.status === 'SUCCESS' ? (
          <div>
            <span className="label">Respuesta completa</span>
            <pre>{json(log.response)}</pre>
          </div>
        ) : (
          <div>
            <span className="label">Error</span>
            <pre className="error-text">{log.errorMessage}</pre>
            <span className="label">Stack trace resumido</span>
            <pre className="error-text">{log.stackTrace}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
