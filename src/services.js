export const SERVICES = [
  {
    id: 'inventory',
    name: 'Inventario',
    className: 'InventoryService',
    color: '#38bdf8',
    operations: [
      { name: 'listProducts', example: [] },
      { name: 'getProduct', example: ['P-001'], hint: '[productId]' },
      { name: 'checkStock', example: ['P-001'], hint: '[productId]' },
      { name: 'addStock', example: ['P-001', 10], hint: '[productId, cantidad]' },
      { name: 'reserveStock', example: ['P-001', 2], hint: '[productId, cantidad]' },
    ],
  },
  {
    id: 'orders',
    name: 'Pedidos',
    className: 'OrderService',
    color: '#a78bfa',
    operations: [
      { name: 'createOrder', example: ['P-002', 1, 'cliente.demo'], hint: '[productId, cantidad, cliente?]' },
      { name: 'getOrder', example: ['ORD-1001'], hint: '[orderId]' },
      { name: 'listOrders', example: [] },
      { name: 'cancelOrder', example: ['ORD-1001'], hint: '[orderId]' },
    ],
  },
  {
    id: 'payments',
    name: 'Pagos',
    className: 'PaymentService',
    color: '#f59e0b',
    operations: [
      { name: 'processPayment', example: ['ORD-1001', 1200, 'CARD'], hint: '[orderId, monto, metodo?]' },
      { name: 'getPayment', example: ['PAY-5001'], hint: '[paymentId]' },
      { name: 'refundPayment', example: ['PAY-5001'], hint: '[paymentId]' },
      { name: 'listPayments', example: [] },
    ],
  },
]

export const serviceById = Object.fromEntries(SERVICES.map((s) => [s.id, s]))
