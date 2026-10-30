# Monitoreo de Microservicios — Frontend (React + Vite + Recharts)

Dashboard de observabilidad en tiempo real para el backend de monitoreo de microservicios.

## Funcionalidades

- 3 tarjetas de servicio: total de llamadas, tasa de éxito y tiempo promedio.
- Indicador visual: si la tasa de error de un servicio supera el 15%, la tarjeta se resalta en rojo.
- Gráfica de líneas (Recharts) con las últimas 20 llamadas por servicio y su tiempo de respuesta; los errores se marcan en rojo.
- Tabla de logs en tiempo real con polling cada 3 segundos (requestId, servicio, operación, duración, estado).
- Filtros por servicio, estado (SUCCESS/ERROR) y rango de fechas, con paginación.
- Al hacer clic en un log se expanden los detalles: parámetros de entrada, respuesta completa o error con stack trace.
- Botón «Simular carga» que llama a `POST /api/metrics/simulate-load` y actualiza el dashboard.
- Extras: KPIs globales, consola para ejecutar cualquier operación, pausar/reanudar el polling, aviso mientras el servidor gratuito despierta, modo claro/oscuro automático y diseño responsive.

## Ejecutar en local

```bash
npm install
cp .env.example .env   # ajusta VITE_API_URL si el backend no está en localhost:8080
npm run dev
```

## Despliegue (Vercel)

Importar el repositorio en Vercel (framework: Vite) y definir la variable de entorno
`VITE_API_URL` con la URL pública del backend, por ejemplo `https://monitoreo-microservicios-api.onrender.com`.
