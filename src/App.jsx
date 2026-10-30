import { useCallback, useEffect, useRef, useState } from 'react'
import { getLogs, getSummary, simulateLoad } from './api.js'
import { SERVICES } from './services.js'
import Header from './components/Header.jsx'
import ServiceCards from './components/ServiceCards.jsx'
import ResponseChart from './components/ResponseChart.jsx'
import LogsPanel from './components/LogsPanel.jsx'
import OperationConsole from './components/OperationConsole.jsx'
import Toasts from './components/Toasts.jsx'

const POLL_MS = 3000
const EMPTY_FILTERS = { service: '', status: '', from: '', to: '' }

export default function App() {
  const [summary, setSummary] = useState(null)
  const [recent, setRecent] = useState({})
  const [logsPage, setLogsPage] = useState(null)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [connection, setConnection] = useState('connecting') // connecting | online | offline
  const [lastUpdated, setLastUpdated] = useState(null)
  const [live, setLive] = useState(true)
  const [simulating, setSimulating] = useState(false)
  const [toasts, setToasts] = useState([])
  const inFlight = useRef(false)

  const notify = useCallback((message, kind = 'info') => {
    const id = crypto.randomUUID()
    setToasts((t) => [...t, { id, message, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000)
  }, [])

  const refresh = useCallback(async () => {
    if (inFlight.current) return
    inFlight.current = true
    try {
      const [sum, logs, ...perService] = await Promise.all([
        getSummary(),
        getLogs({ ...filters, page, size }),
        ...SERVICES.map((s) => getLogs({ service: s.id, size: 20 })),
      ])
      setSummary(sum)
      setLogsPage(logs)
      setRecent(Object.fromEntries(SERVICES.map((s, i) => [s.id, perService[i].content])))
      setConnection('online')
      setLastUpdated(new Date())
    } catch {
      setConnection((c) => (c === 'online' ? 'offline' : c))
    } finally {
      inFlight.current = false
    }
  }, [filters, page, size])

  // Carga inmediata al cambiar filtros/pagina y polling cada 3 s (pausado si la pestana no esta visible).
  useEffect(() => {
    refresh()
    if (!live) return
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') refresh()
    }, POLL_MS)
    return () => clearInterval(id)
  }, [refresh, live])

  // Si la primera conexion tarda, Render probablemente esta despertando el servidor.
  useEffect(() => {
    if (connection !== 'connecting') return
    const id = setTimeout(() => setConnection((c) => (c === 'connecting' ? 'waking' : c)), 4000)
    return () => clearTimeout(id)
  }, [connection])

  const changeFilters = (next) => {
    setFilters(next)
    setPage(0)
  }

  const runSimulation = async () => {
    setSimulating(true)
    try {
      const r = await simulateLoad()
      notify(`Carga simulada: ${r.totalCalls} llamadas · ${r.successCount} exitosas · ${r.errorCount} con error`, r.errorCount ? 'warn' : 'success')
      inFlight.current = false
      await refresh()
    } catch (e) {
      notify(`No se pudo simular la carga: ${e.message}`, 'error')
    } finally {
      setSimulating(false)
    }
  }

  return (
    <div className="app">
      <Header
        summary={summary}
        connection={connection}
        lastUpdated={lastUpdated}
        live={live}
        onToggleLive={() => setLive((v) => !v)}
        simulating={simulating}
        onSimulate={runSimulation}
      />

      {(connection === 'waking' || connection === 'offline') && (
        <div className={`banner ${connection}`}>
          <span className="spinner" />
          {connection === 'waking'
            ? 'Despertando el servidor… El backend está en el plan gratuito de Render y puede tardar hasta un minuto en responder la primera vez.'
            : 'Se perdió la conexión con el backend. Reintentando automáticamente…'}
        </div>
      )}

      <main className="content">
        <ServiceCards summary={summary} />

        <div className="grid-2">
          <ResponseChart recent={recent} />
          <OperationConsole
            onExecuted={(log) => {
              notify(
                `${log.serviceId}.${log.operation} → ${log.status} en ${log.durationMs} ms`,
                log.status === 'SUCCESS' ? 'success' : 'error',
              )
              refresh()
            }}
            onError={(msg) => notify(msg, 'error')}
          />
        </div>

        <LogsPanel
          logsPage={logsPage}
          filters={filters}
          onFiltersChange={changeFilters}
          onReset={() => changeFilters(EMPTY_FILTERS)}
          page={page}
          onPageChange={setPage}
          size={size}
          onSizeChange={(s) => {
            setSize(s)
            setPage(0)
          }}
          live={live}
        />
      </main>

      <footer className="footer">
        Sistema de monitoreo de microservicios con Proxy de auditoría y logging · Spring Boot + React
      </footer>

      <Toasts toasts={toasts} />
    </div>
  )
}
