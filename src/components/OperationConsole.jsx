import { useState } from 'react'
import { callService } from '../api.js'
import { SERVICES, serviceById } from '../services.js'
import { json } from '../format.js'

/** Permite invocar manualmente cualquier operacion a traves del LoggingProxy. */
export default function OperationConsole({ onExecuted, onError }) {
  const [serviceId, setServiceId] = useState(SERVICES[0].id)
  const [operation, setOperation] = useState(SERVICES[0].operations[0].name)
  const [params, setParams] = useState(json(SERVICES[0].operations[0].example))
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)

  const service = serviceById[serviceId]
  const op = service.operations.find((o) => o.name === operation)

  const pickService = (id) => {
    const first = serviceById[id].operations[0]
    setServiceId(id)
    setOperation(first.name)
    setParams(json(first.example))
  }

  const pickOperation = (name) => {
    setOperation(name)
    setParams(json(service.operations.find((o) => o.name === name).example))
  }

  const execute = async (e) => {
    e.preventDefault()
    let parsed
    try {
      parsed = params.trim() ? JSON.parse(params) : []
      if (!Array.isArray(parsed)) throw new Error()
    } catch {
      onError('Los parámetros deben ser un arreglo JSON, por ejemplo ["P-001", 5]')
      return
    }
    setRunning(true)
    try {
      const log = await callService(serviceId, operation, parsed)
      setResult(log)
      onExecuted(log)
    } catch (err) {
      onError(err.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <section className="card console-card">
      <div className="card-title">
        <div>
          <h3>Probar un servicio</h3>
          <p>
            <code>POST /api/services/{serviceId}/{operation}</code>
          </p>
        </div>
      </div>

      <form onSubmit={execute} className="console-form">
        <div className="seg">
          {SERVICES.map((s) => (
            <button
              type="button"
              key={s.id}
              className={s.id === serviceId ? 'active' : ''}
              style={{ '--svc': s.color }}
              onClick={() => pickService(s.id)}
            >
              {s.name}
            </button>
          ))}
        </div>
        <label>
          Operación
          <select value={operation} onChange={(e) => pickOperation(e.target.value)}>
            {service.operations.map((o) => (
              <option key={o.name} value={o.name}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Parámetros (arreglo JSON) {op?.hint && <span className="hint">{op.hint}</span>}
          <textarea rows={2} value={params} onChange={(e) => setParams(e.target.value)} spellCheck={false} />
        </label>
        <button className="btn primary" disabled={running}>
          {running ? (
            <>
              <span className="spinner small" /> Ejecutando…
            </>
          ) : (
            'Ejecutar'
          )}
        </button>
      </form>

      {result && (
        <div className={`console-result ${result.status === 'SUCCESS' ? 'ok' : 'err'}`}>
          <div className="result-head">
            <span className={`pill ${result.status === 'SUCCESS' ? 'ok' : 'err'}`}>{result.status}</span>
            <span className="mono">{result.durationMs} ms</span>
            <span className="mono muted" title={result.requestId}>
              {result.requestId.slice(0, 8)}…
            </span>
          </div>
          <pre>{result.status === 'SUCCESS' ? json(result.response) : result.errorMessage}</pre>
        </div>
      )}
    </section>
  )
}
