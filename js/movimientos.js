/* ══════════════════════════════════════════
   MOVIMIENTOS.JS
   Lógica de la página de Movimientos.
   Persistencia local (localStorage) — no hay
   backend conectado todavía.
   ══════════════════════════════════════════ */

// ── CATEGORÍAS (íconos y color de fondo del ícono) ──
const CATEGORIAS = {
  sueldo:         { nombre: 'Sueldo',         icono: '💼', color: '#e0f2fe' },
  comida:         { nombre: 'Comida',         icono: '🍔', color: '#fef3c7' },
  transporte:     { nombre: 'Transporte',     icono: '🚗', color: '#e0e7ff' },
  entretenimiento:{ nombre: 'Entretenimiento',icono: '🎬', color: '#fce7f3' },
  salud:          { nombre: 'Salud',          icono: '🏥', color: '#fee2e2' },
  compras:        { nombre: 'Compras',        icono: '🛍️', color: '#dcfce7' },
  servicios:      { nombre: 'Servicios',      icono: '💡', color: '#fef9c3' },
  otros:          { nombre: 'Otros',          icono: '📦', color: '#f3f4f6' },
};

const KEY_STORAGE = 'fincontrol_movimientos';

// ── DATOS DE EJEMPLO (solo se usan la primera vez, si no hay nada guardado) ──
const DATOS_EJEMPLO = [
  { id: crearId(), tipo: 'ingreso', monto: 2500,  categoria: 'sueldo',     descripcion: 'Sueldo de agosto',       fecha: hoyMenos(2) },
  { id: crearId(), tipo: 'gasto',   monto: 35.50, categoria: 'comida',     descripcion: 'Almuerzo con el equipo', fecha: hoyMenos(2) },
  { id: crearId(), tipo: 'gasto',   monto: 18,    categoria: 'transporte', descripcion: 'Taxi al trabajo',        fecha: hoyMenos(1) },
  { id: crearId(), tipo: 'gasto',   monto: 89.90, categoria: 'servicios', descripcion: 'Recibo de luz',           fecha: hoyMenos(1) },
  { id: crearId(), tipo: 'gasto',   monto: 120,   categoria: 'compras',    descripcion: 'Ropa de invierno',       fecha: hoyMenos(0) },
  { id: crearId(), tipo: 'gasto',   monto: 45,    categoria: 'entretenimiento', descripcion: 'Cine con amigos',   fecha: hoyMenos(0) },
];

function crearId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function hoyMenos(dias) {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d.toISOString().slice(0, 10);
}

// ── ESTADO ──
let movimientos = [];
let tipoModal = 'ingreso'; // tipo seleccionado dentro del modal (toggle)
let idAEliminar = null;

// ── DOM ──
const listaMovimientos   = document.getElementById('listaMovimientos');
const estadoVacio        = document.getElementById('estadoVacio');
const filtroBusqueda     = document.getElementById('filtroBusqueda');
const filtroTipo         = document.getElementById('filtroTipo');
const filtroCategoria    = document.getElementById('filtroCategoria');
const btnLimpiarFiltros  = document.getElementById('btnLimpiarFiltros');
const resumenIngresos    = document.getElementById('resumenIngresos');
const resumenGastos      = document.getElementById('resumenGastos');
const resumenBalance     = document.getElementById('resumenBalance');

const btnNuevo        = document.getElementById('btnNuevo');
const modalOverlay     = document.getElementById('modalOverlay');
const modalTitulo      = document.getElementById('modalTitulo');
const btnCerrarModal   = document.getElementById('btnCerrarModal');
const formMovimiento   = document.getElementById('formMovimiento');
const movId            = document.getElementById('movId');
const movMonto         = document.getElementById('movMonto');
const movCategoria     = document.getElementById('movCategoria');
const movDescripcion   = document.getElementById('movDescripcion');
const movFecha         = document.getElementById('movFecha');
const modalError       = document.getElementById('modalError');
const botonesTipo      = document.querySelectorAll('.btn-tipo');

const modalConfirmOverlay   = document.getElementById('modalConfirmOverlay');
const btnCancelarEliminar   = document.getElementById('btnCancelarEliminar');
const btnConfirmarEliminar  = document.getElementById('btnConfirmarEliminar');

const toast = document.getElementById('toast');

// ══════════════════════════════════════════
// PERSISTENCIA
// ══════════════════════════════════════════
function cargarMovimientos() {
  const guardado = localStorage.getItem(KEY_STORAGE);
  if (guardado) {
    try {
      movimientos = JSON.parse(guardado);
      return;
    } catch (_) { /* si está corrupto, se reemplaza abajo */ }
  }
  movimientos = DATOS_EJEMPLO;
  guardarMovimientos();
}

function guardarMovimientos() {
  localStorage.setItem(KEY_STORAGE, JSON.stringify(movimientos));
}

// ══════════════════════════════════════════
// INICIALIZAR SELECTS DE CATEGORÍA
// ══════════════════════════════════════════
function poblarSelectsCategoria() {
  // Filtro (con opción "Todas")
  Object.entries(CATEGORIAS).forEach(([clave, cat]) => {
    const opt1 = document.createElement('option');
    opt1.value = clave;
    opt1.textContent = `${cat.icono} ${cat.nombre}`;
    filtroCategoria.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = clave;
    opt2.textContent = `${cat.icono} ${cat.nombre}`;
    movCategoria.appendChild(opt2);
  });
}

// ══════════════════════════════════════════
// FORMATO
// ══════════════════════════════════════════
function formatMonto(valor) {
  return 'S/ ' + Number(valor).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatFechaGrupo(fechaISO) {
  const hoy = new Date().toISOString().slice(0, 10);
  const ayerDate = new Date();
  ayerDate.setDate(ayerDate.getDate() - 1);
  const ayer = ayerDate.toISOString().slice(0, 10);

  if (fechaISO === hoy) return 'Hoy';
  if (fechaISO === ayer) return 'Ayer';

  const d = new Date(fechaISO + 'T00:00:00');
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ══════════════════════════════════════════
// FILTRAR
// ══════════════════════════════════════════
function obtenerMovimientosFiltrados() {
  const q    = filtroBusqueda.value.trim().toLowerCase();
  const tipo = filtroTipo.value;
  const cat  = filtroCategoria.value;

  return movimientos
    .filter(m => !q || m.descripcion.toLowerCase().includes(q))
    .filter(m => tipo === 'todos' || m.tipo === tipo)
    .filter(m => cat === 'todas' || m.categoria === cat)
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id.localeCompare(a.id));
}

// ══════════════════════════════════════════
// RENDER
// ══════════════════════════════════════════
function render() {
  const filtrados = obtenerMovimientosFiltrados();

  // Resumen del filtro actual
  const ingresos = filtrados.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + Number(m.monto), 0);
  const gastos   = filtrados.filter(m => m.tipo === 'gasto').reduce((s, m) => s + Number(m.monto), 0);
  resumenIngresos.textContent = formatMonto(ingresos);
  resumenGastos.textContent   = formatMonto(gastos);
  resumenBalance.textContent  = formatMonto(ingresos - gastos);
  resumenBalance.className = 'summary-value' + (ingresos - gastos >= 0 ? '' : ' summary-value--negative');

  listaMovimientos.innerHTML = '';

  if (filtrados.length === 0) {
    estadoVacio.classList.add('visible');
    return;
  }
  estadoVacio.classList.remove('visible');

  // Agrupar por fecha
  const grupos = {};
  filtrados.forEach(m => {
    if (!grupos[m.fecha]) grupos[m.fecha] = [];
    grupos[m.fecha].push(m);
  });

  Object.keys(grupos)
    .sort((a, b) => b.localeCompare(a))
    .forEach(fecha => {
      const items = grupos[fecha];
      const subtotal = items.reduce((s, m) => s + (m.tipo === 'ingreso' ? Number(m.monto) : -Number(m.monto)), 0);

      const bloque = document.createElement('div');
      bloque.innerHTML = `
        <div class="day-group__header">
          <h3 class="day-group__title">${formatFechaGrupo(fecha)}</h3>
          <span class="day-group__subtotal ${subtotal >= 0 ? 'day-group__subtotal--positive' : 'day-group__subtotal--negative'}">
            ${subtotal >= 0 ? '+' : '-'}${formatMonto(Math.abs(subtotal))}
          </span>
        </div>
        <div class="day-group__list" data-lista-dia></div>
      `;

      const listaDia = bloque.querySelector('[data-lista-dia]');
      items.forEach(m => listaDia.appendChild(crearFilaMovimiento(m)));

      listaMovimientos.appendChild(bloque);
    });
}

function crearFilaMovimiento(m) {
  const cat = CATEGORIAS[m.categoria] || CATEGORIAS.otros;
  const esIngreso = m.tipo === 'ingreso';

  const row = document.createElement('div');
  row.className = 'mov-row';
  row.innerHTML = `
    <div class="mov-icono" style="background-color:${cat.color}">${cat.icono}</div>

    <div class="mov-content">
      <p class="mov-desc">${escapeHtml(m.descripcion)}</p>
      <p class="mov-cat">${cat.nombre}</p>
    </div>

    <p class="mov-amount ${esIngreso ? 'mov-amount--income' : 'mov-amount--expense'}">
      ${esIngreso ? '+' : '-'}${formatMonto(m.monto)}
    </p>

    <div class="mov-acciones">
      <button class="mov-action-btn" data-accion="editar" data-id="${m.id}" aria-label="Editar">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </button>
      <button class="mov-action-btn mov-action-btn--danger" data-accion="eliminar" data-id="${m.id}" aria-label="Eliminar">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  `;
  return row;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ══════════════════════════════════════════
// MODALES: CIERRE UNIVERSAL
// ══════════════════════════════════════════
function cerrarTodosLosModales() {
  modalOverlay.classList.add('hidden');
  modalConfirmOverlay.classList.add('hidden');
}

// ══════════════════════════════════════════
// MODAL: NUEVO / EDITAR
// ══════════════════════════════════════════
function abrirModal(movimiento = null) {
  cerrarTodosLosModales(); // evita que quede otro modal abierto por debajo
  formMovimiento.reset();
  modalError.classList.remove('visible');

  if (movimiento) {
    modalTitulo.textContent = 'Editar movimiento';
    movId.value = movimiento.id;
    movMonto.value = movimiento.monto;
    movCategoria.value = movimiento.categoria;
    movDescripcion.value = movimiento.descripcion;
    movFecha.value = movimiento.fecha;
    seleccionarTipoModal(movimiento.tipo);
  } else {
    modalTitulo.textContent = 'Nuevo movimiento';
    movId.value = '';
    movFecha.value = new Date().toISOString().slice(0, 10);
    seleccionarTipoModal('gasto');
  }

  modalOverlay.classList.remove('hidden');
  setTimeout(() => movMonto.focus(), 50);
}

function seleccionarTipoModal(tipo) {
  tipoModal = tipo;
  botonesTipo.forEach(btn => {
    btn.setAttribute('data-active', btn.dataset.tipo === tipo ? 'true' : 'false');
  });
}

botonesTipo.forEach(btn => {
  btn.addEventListener('click', () => seleccionarTipoModal(btn.dataset.tipo));
});

btnNuevo.addEventListener('click', () => abrirModal());
btnCerrarModal.addEventListener('click', cerrarTodosLosModales);

// Clic fuera del modal cierra CUALQUIER overlay que esté abierto
[modalOverlay, modalConfirmOverlay].forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) cerrarTodosLosModales();
  });
});

// Escape cierra cualquier modal que esté abierto
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') cerrarTodosLosModales();
});

// ── GUARDAR (crear o actualizar) ──
formMovimiento.addEventListener('submit', (e) => {
  e.preventDefault();

  const monto = parseFloat(movMonto.value);
  if (!monto || monto <= 0) {
    modalError.textContent = 'Ingresa un monto válido mayor a 0.';
    modalError.classList.add('visible');
    return;
  }
  if (!movDescripcion.value.trim()) {
    modalError.textContent = 'La descripción es requerida.';
    modalError.classList.add('visible');
    return;
  }

  const datos = {
    tipo: tipoModal,
    monto: monto,
    categoria: movCategoria.value,
    descripcion: movDescripcion.value.trim(),
    fecha: movFecha.value,
  };

  if (movId.value) {
    // Editar existente
    const idx = movimientos.findIndex(m => m.id === movId.value);
    if (idx !== -1) movimientos[idx] = { ...movimientos[idx], ...datos };
    mostrarToast('Movimiento actualizado.');
  } else {
    // Crear nuevo
    movimientos.push({ id: crearId(), ...datos });
    mostrarToast('Movimiento registrado.');
  }

  guardarMovimientos();
  cerrarTodosLosModales();
  render();
});

// ══════════════════════════════════════════
// ACCIONES: EDITAR / ELIMINAR (delegación de eventos)
// ══════════════════════════════════════════
listaMovimientos.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-accion]');
  if (!btn) return;
  const id = btn.dataset.id;
  const movimiento = movimientos.find(m => m.id === id);
  if (!movimiento) return;

  if (btn.dataset.accion === 'editar') {
    abrirModal(movimiento);
  } else if (btn.dataset.accion === 'eliminar') {
    cerrarTodosLosModales(); // evita que quede el modal de edición abierto por debajo
    idAEliminar = id;
    modalConfirmOverlay.classList.remove('hidden');
  }
});

btnCancelarEliminar.addEventListener('click', () => {
  idAEliminar = null;
  cerrarTodosLosModales();
});

btnConfirmarEliminar.addEventListener('click', () => {
  if (idAEliminar) {
    movimientos = movimientos.filter(m => m.id !== idAEliminar);
    guardarMovimientos();
    render();
    mostrarToast('Movimiento eliminado.', 'danger');
  }
  idAEliminar = null;
  cerrarTodosLosModales();
});

// ══════════════════════════════════════════
// FILTROS
// ══════════════════════════════════════════
let debounceBusqueda;
filtroBusqueda.addEventListener('input', () => {
  clearTimeout(debounceBusqueda);
  debounceBusqueda = setTimeout(render, 200);
});
filtroTipo.addEventListener('change', render);
filtroCategoria.addEventListener('change', render);

btnLimpiarFiltros.addEventListener('click', () => {
  filtroBusqueda.value = '';
  filtroTipo.value = 'todos';
  filtroCategoria.value = 'todas';
  render();
});

// ══════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════
let toastTimer;
function mostrarToast(mensaje, tipo = 'ok') {
  clearTimeout(toastTimer);
  toast.textContent = mensaje;
  toast.classList.remove('toast-danger');
  if (tipo === 'danger') toast.classList.add('toast-danger');
  requestAnimationFrame(() => toast.classList.add('visible'));
  toastTimer = setTimeout(() => {
    toast.classList.remove('visible');
  }, 2200);
}

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
cargarMovimientos();
poblarSelectsCategoria();
render();