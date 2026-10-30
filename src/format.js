const timeFmt = new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
const dateTimeFmt = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'medium' })

export const formatTime = (iso) => timeFmt.format(new Date(iso))
export const formatDateTime = (iso) => dateTimeFmt.format(new Date(iso))
export const formatMs = (ms) => `${Math.round(ms).toLocaleString('es-CO')} ms`
export const formatPct = (v) => `${Number(v).toLocaleString('es-CO', { maximumFractionDigits: 1 })}%`
export const formatInt = (v) => Number(v).toLocaleString('es-CO')
export const json = (v) => JSON.stringify(v, null, 2)
