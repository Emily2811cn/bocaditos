const CLAVE = "pedido_bocaditos_v2";

const waLink = (msg) => `https://wa.me/${CONFIG.telefono}?text=${encodeURIComponent(msg)}`;
const dinero = (n) => "$" + n.toFixed(2);
const buscar = (id) => BOCADITOS.find(b => b.id === id);
// Solo los bocaditos con campo "gratis" en data.js muestran la etiqueta (ej: gratis: "Aderezo de mayonesa")
const etiquetaIncluye = (b) => b.gratis
  ? `<span class="etiqueta-gratis"><span class="gratis-tag">GRATIS</span>${b.gratis}</span>` : "";
const nombreLinea = (b, opcion) => opcion ? `${b.nombre} (${opcion})` : b.nombre;
const paso = (b) => b.paso || PASO_POR_DEFECTO;
const minimo = (b) => b.minimo || MINIMO_POR_DEFECTO;
/* Nombre de la unidad: por defecto "unidades". Un postre puede usar unidad: ["porción", "porciones"] */
const nomUnidad = (b, n) => b.unidad ? (n === 1 ? b.unidad[0] : b.unidad[1]) : "unidades";
const textoCant = (b, n) => `${n} ${nomUnidad(b, n)}`;

/* Tramo que aplica a N unidades: la presentación más grande que no pase de N.
   Ej. con 50 = $10 y 100 = $18: 50 → tramo de 50; 100, 150, 200... → tramo de 100 ($9 cada 50). */
function tramo(b, unidades) {
  return b.presentaciones
    .filter(p => p.cantidad <= unidades)
    .sort((x, y) => y.cantidad - x.cantidad)[0] || null;
}
/* Tramo más grande (el último escalón de precios) */
const tramoTop = (b) => [...b.presentaciones].sort((x, y) => y.cantidad - x.cantidad)[0];
/* ¿Aplica "extra"? Es un precio fijo por cada paso que pase del tramo más grande.
   Ej. 12 = $15, 24 = $25 y extra: 10 → 36 = $35, 48 = $45, 60 = $55... */
const usaExtra = (b, unidades) => b.extra != null && unidades > tramoTop(b).cantidad;

/* Precio de N unidades = precio del tramo × (N ÷ cantidad del tramo), o con "extra" si el bocadito lo tiene.
   null = sin precio */
function precioDe(b, unidades) {
  const t = tramo(b, unidades);
  if (!t || t.precio == null) return null;
  if (usaExtra(b, unidades)) {
    const top = tramoTop(b);
    return Math.round((top.precio + (unidades - top.cantidad) / paso(b) * b.extra) * 100) / 100;
  }
  return Math.round(t.precio * (unidades / t.cantidad) * 100) / 100;
}
/* Texto del cálculo, ej. "3 × $9.00" (precio de cada paso según el tramo) */
function detalleCuenta(b, unidades) {
  const t = tramo(b, unidades);
  if (!t || t.precio == null) return "";
  if (usaExtra(b, unidades)) {
    const top = tramoTop(b);
    return `${dinero(top.precio)} + ${(unidades - top.cantidad) / paso(b)} × ${dinero(b.extra)}`;
  }
  const porPaso = Math.round(t.precio * paso(b) / t.cantidad * 100) / 100;
  return `${unidades / paso(b)} × ${dinero(porPaso)}`;
}

/* ---- Datos del negocio en toda la página ---- */
document.querySelectorAll("[data-negocio]").forEach(e => e.textContent = CONFIG.negocio);
document.querySelectorAll("[data-ciudad]").forEach(e => e.textContent = CONFIG.ciudad);
document.querySelectorAll("[data-instagram]").forEach(e => e.textContent = CONFIG.instagram);
document.querySelectorAll("[data-wa]").forEach(e => e.href = waLink(CONFIG.saludo));

/* ---- Estado del pedido (se guarda en el navegador del cliente) ---- */
let filtro = "todos";
let seleccion = null; // { id, cantidad } mientras el modal está abierto

function cargarPedido() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) || "[]");
    // solo conserva líneas que todavía existen en el catálogo
    return guardado.filter(l => {
      const b = buscar(l.id);
      return b && (b.opciones ? b.opciones.includes(l.opcion) : !l.opcion) && l.unidades >= minimo(b) && l.unidades % paso(b) === 0 && l.unidades <= MAX_UNIDADES;
    });
  } catch (e) { return []; }
}
function guardarPedido() {
  try { localStorage.setItem(CLAVE, JSON.stringify(pedido)); } catch (e) { /* sin almacenamiento */ }
}
let pedido = cargarPedido();

/* ---- Carta ---- */
const lista = document.getElementById("lista");

function listaPrecios(b) {
  return `<ul class="lista-precios">${b.presentaciones.map(p =>
    `<li><span>${textoCant(b, p.cantidad)}</span><strong>${p.precio != null ? dinero(p.precio) : "—"}</strong></li>`).join("")}</ul>`;
}
function unidadesEnPedido(id) {
  return pedido.filter(x => x.id === id).reduce((t, x) => t + x.unidades, 0);
}

function pintarCarta() {
  lista.innerHTML = BOCADITOS
    .filter(b => filtro === "todos" || b.tipo === filtro)
    .map(b => {
      const u = unidadesEnPedido(b.id);
      return `
      <div class="col-12 col-md-4 col-lg-3">
        <div class="card card-bocadito${u ? " en-pedido" : ""}" role="button" tabindex="0" data-id="${b.id}" aria-label="Ver detalles de ${b.nombre}">
          ${u ? `<span class="marca-pedido">✓ ${u} en tu pedido</span>` : ""}
          ${b.foto
            ? `<img class="foto ${b.tipo}" src="${b.foto}" alt="${b.nombre}" loading="lazy" decoding="async">`
            : `<div class="foto ${b.tipo}" aria-hidden="true">${b.emoji}</div>`}
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${b.nombre}</h5>
            <p class="card-text text-secondary">${b.desc}</p>
            ${etiquetaIncluye(b)}
            <div class="flex-grow-1">${listaPrecios(b)}</div>
            <span class="ver-mas">${u ? "Editar" : "Ver detalles"}</span>
          </div>
        </div>
      </div>`;
    }).join("");
}

function aplicarFiltro(f) {
  filtro = f;
  document.querySelectorAll(".filtros .btn").forEach(x => x.classList.toggle("active", x.dataset.f === f));
  pintarCarta();
}
document.querySelectorAll(".filtros .btn").forEach(btn => btn.addEventListener("click", () => aplicarFiltro(btn.dataset.f)));

/* Enlaces del menú (Dulces / Salados / Postres) */
document.querySelectorAll("[data-filtro]").forEach(a => a.addEventListener("click", () => {
  aplicarFiltro(a.dataset.filtro);
  bootstrap.Collapse.getOrCreateInstance(document.getElementById("menu"), { toggle: false }).hide();
}));
document.querySelectorAll("#menu .nav-link:not([data-filtro])").forEach(a => a.addEventListener("click", () => {
  bootstrap.Collapse.getOrCreateInstance(document.getElementById("menu"), { toggle: false }).hide();
}));

/* ---- Modal de detalles ---- */
const modalEl = document.getElementById("modalDetalle");
const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
const btnAgregar = document.getElementById("modalAgregar");

function textoPrecio(b, unidades) {
  const p = precioDe(b, unidades);
  return p != null ? dinero(p) : "Precio por confirmar";
}

function pintarContador() {
  const b = buscar(seleccion.id);
  document.getElementById("cantNum").textContent = seleccion.unidades;
  document.getElementById("cantUnidad").textContent = nomUnidad(b, seleccion.unidades);
  document.getElementById("cantPrecio").textContent = textoPrecio(b, seleccion.unidades);
  document.getElementById("cantMenos").disabled = seleccion.unidades <= minimo(b);
  document.getElementById("cantMas").disabled = seleccion.unidades + paso(b) > MAX_UNIDADES;
  btnAgregar.disabled = !!b.opciones && !seleccion.opcion;
  const existe = pedido.some(l => l.id === seleccion.id && (l.opcion || null) === seleccion.opcion);
  btnAgregar.textContent = existe ? "Actualizar pedido" : "Agregar al pedido";
}

function abrirDetalle(id) {
  const b = buscar(id);
  if (!b) return;
  const previo = b.opciones ? 0 : unidadesEnPedido(id);
  seleccion = { id, unidades: previo || minimo(b), opcion: null };
  document.getElementById("modalTitulo").textContent = b.nombre;
  document.getElementById("modalCuerpo").innerHTML = `
    <div class="row g-3 align-items-center">
      <div class="col-12 col-md-5">
        ${b.foto
          ? `<img class="foto-modal ${b.tipo}" src="${b.foto}" alt="${b.nombre}">`
          : `<div class="foto-modal ${b.tipo}" aria-hidden="true">${b.emoji}</div>`}
      </div>
      <div class="col-12 col-md-7">
        <p class="mb-2">${b.desc}</p>
        ${etiquetaIncluye(b) ? `<p class="mb-3">${etiquetaIncluye(b)}</p>` : ""}
        ${b.opciones ? `
        <h6>Elige el sabor</h6>
        <div class="d-flex flex-wrap gap-2 mb-3" id="opcionesSabor">
          ${b.opciones.map((o, i) => `
            <input type="radio" class="btn-check" name="sabor" id="sabor${i}" value="${o}" autocomplete="off">
            <label class="btn btn-opcion" for="sabor${i}">${o}</label>`).join("")}
        </div>` : ""}
        <h6>Elige la cantidad</h6>
        <div class="contador">
          <button type="button" class="btn" id="cantMenos" aria-label="Quitar ${textoCant(b, paso(b))}">−</button>
          <div class="contador-centro">
            <span class="contador-num" id="cantNum" aria-live="polite"></span>
            <span class="contador-unidad" id="cantUnidad">unidades</span>
          </div>
          <button type="button" class="btn" id="cantMas" aria-label="Agregar ${textoCant(b, paso(b))}">+</button>
        </div>
        <p class="contador-precio mb-1" id="cantPrecio"></p>
        <p class="small text-secondary mb-0">${paso(b) === 1 && minimo(b) === 1 ? `Puedes pedir desde 1 ${nomUnidad(b, 1)}` : `Pedido mínimo: ${textoCant(b, minimo(b))} · de ${paso(b)} en ${paso(b)}`}</p>
      </div>
    </div>`;
  pintarContador();
  modal.show();
}

document.getElementById("modalCuerpo").addEventListener("change", e => {
  if (e.target.name !== "sabor" || !seleccion) return;
  seleccion.opcion = e.target.value;
  const linea = pedido.find(l => l.id === seleccion.id && l.opcion === seleccion.opcion);
  if (linea) seleccion.unidades = linea.unidades;
  pintarContador();
});

document.getElementById("modalCuerpo").addEventListener("click", e => {
  if (!seleccion) return;
  const b = buscar(seleccion.id);
  if (e.target.closest("#cantMas") && seleccion.unidades + paso(b) <= MAX_UNIDADES) seleccion.unidades += paso(b);
  else if (e.target.closest("#cantMenos") && seleccion.unidades - paso(b) >= minimo(b)) seleccion.unidades -= paso(b);
  else return;
  pintarContador();
});

btnAgregar.addEventListener("click", () => {
  if (!seleccion) return;
  const b = buscar(seleccion.id);
  if (b.opciones && !seleccion.opcion) return;
  const op = seleccion.opcion || undefined;
  const linea = pedido.find(l => l.id === seleccion.id && l.opcion === op);
  if (linea) linea.unidades = seleccion.unidades;
  else pedido.push({ id: seleccion.id, unidades: seleccion.unidades, ...(op ? { opcion: op } : {}) });
  modal.hide();
  avisar(`✓ ${nombreLinea(b, op)} (${textoCant(b, seleccion.unidades)}) en tu pedido`);
  refrescar();
});

lista.addEventListener("click", e => {
  const card = e.target.closest(".card-bocadito");
  if (card) abrirDetalle(card.dataset.id);
});
lista.addEventListener("keydown", e => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const card = e.target.closest(".card-bocadito");
  if (card) { e.preventDefault(); abrirDetalle(card.dataset.id); }
});

/* ---- Aviso ---- */
function avisar(texto) {
  document.getElementById("toastTexto").textContent = texto;
  bootstrap.Toast.getOrCreateInstance(document.getElementById("toastAgregado")).show();
}

/* ---- Panel del pedido ---- */
const listaPedido = document.getElementById("listaPedido");
const totalPedido = document.getElementById("totalPedido");
const formPedido = document.getElementById("formPedido");
const pill = document.getElementById("pillPedido");

function resumen() {
  let total = 0, completo = true, unidades = 0;
  const lineas = pedido.map(l => {
    const b = buscar(l.id);
    const sub = precioDe(b, l.unidades);
    if (sub == null) completo = false; else total += sub;
    unidades += l.unidades;
    return { ...l, nombre: nombreLinea(b, l.opcion), emoji: b.emoji, texto: textoCant(b, l.unidades), sub, detalle: detalleCuenta(b, l.unidades) };
  });
  return { lineas, total, completo, unidades };
}

function pintarPedido() {
  const { lineas, total, completo } = resumen();
  if (!lineas.length) {
    listaPedido.innerHTML = `<p class="text-secondary">Aún no has elegido nada. Toca un bocadito de la carta para agregarlo.</p>`;
    formPedido.classList.add("d-none");
    return;
  }
  formPedido.classList.remove("d-none");
  listaPedido.innerHTML = lineas.map(l => `
    <div class="linea-pedido">
      <div class="flex-grow-1">
        <strong>${l.emoji} ${l.nombre}</strong>
        <div class="small text-secondary">${l.texto}</div>
        <div class="small">${l.sub != null ? dinero(l.sub) : "Precio por confirmar"}</div>
      </div>
      <div class="stepper" data-id="${l.id}" data-op="${l.opcion || ""}">
        <button type="button" class="btn btn-sm" data-accion="menos" aria-label="Quitar unidades">−</button>
        <span>${l.unidades}</span>
        <button type="button" class="btn btn-sm" data-accion="mas" aria-label="Agregar unidades">+</button>
        <button type="button" class="btn btn-sm quitar" data-accion="quitar" aria-label="Eliminar">🗑</button>
      </div>
    </div>`).join("");
  totalPedido.textContent = completo ? `Total: ${dinero(total)}` : "Total: se confirma por WhatsApp";
}

listaPedido.addEventListener("click", e => {
  const btn = e.target.closest("[data-accion]");
  if (!btn) return;
  const caja = btn.closest(".stepper");
  const linea = pedido.find(l => l.id === caja.dataset.id && (l.opcion || "") === caja.dataset.op);
  if (!linea) return;
  const b = buscar(linea.id);
  if (btn.dataset.accion === "mas") linea.unidades = Math.min(linea.unidades + paso(b), MAX_UNIDADES);
  if (btn.dataset.accion === "menos" && linea.unidades - paso(b) >= minimo(b)) linea.unidades -= paso(b);
  if (btn.dataset.accion === "quitar") linea.unidades = 0;
  pedido = pedido.filter(l => l.unidades > 0);
  refrescar();
});

document.getElementById("vaciarPedido").addEventListener("click", () => {
  pedido = [];
  refrescar();
});

/* ---- Enviar por WhatsApp ---- */
document.getElementById("enviarPedido").addEventListener("click", () => {
  const nombreEl = document.getElementById("clienteNombre");
  const nombre = nombreEl.value.trim();
  if (!nombre) { nombreEl.classList.add("is-invalid"); nombreEl.focus(); return; }
  nombreEl.classList.remove("is-invalid");

  const { lineas, total, completo, unidades } = resumen();
  if (!lineas.length) return;
  const fecha = document.getElementById("clienteFecha").value;
  const notas = document.getElementById("clienteNotas").value.trim();

  let msg = `Hola, soy ${nombre}. Quiero hacer este pedido:\n\n`;
  msg += lineas.map(l =>
    `• ${l.nombre}: ${l.texto}` + (l.sub != null ? ` (${dinero(l.sub)})` : "")
  ).join("\n");
  msg += `\n\nTotal de unidades: ${unidades}`;
  msg += completo ? `\nTotal: ${dinero(total)}` : `\nTotal: por confirmar`;
  if (fecha) { const [a, m, d] = fecha.split("-"); msg += `\nFecha del evento: ${d}/${m}/${a}`; }
  if (notas) msg += `\nNotas: ${notas}`;

  window.open(waLink(msg), "_blank", "noopener");
});
document.getElementById("clienteNombre").addEventListener("input", e => e.target.classList.remove("is-invalid"));

/* ---- Refrescar todo ---- */
function refrescar() {
  guardarPedido();
  pintarCarta();
  pintarPedido();
  const n = pedido.length;
  document.getElementById("navCount").textContent = n;
  document.getElementById("navCount").classList.toggle("d-none", n === 0);
  document.getElementById("pillCount").textContent = n;
  pill.classList.toggle("d-none", n === 0);
}
refrescar();


/* ---- Los más pedidos y galería (datos en data.js) ---- */
(function favoritos() {
  // Más pedidos: solo el nombre (al tocarlo se abre el detalle de la carta)
  const favoritos = MAS_PEDIDOS.map(buscar).filter(Boolean);
  if (favoritos.length) {
    document.getElementById("masPedidos").innerHTML = favoritos.map(b =>
      `<button type="button" class="chip-favorito" data-id="${b.id}" aria-label="Ver detalles de ${b.nombre}">${b.nombre}</button>`).join("");
    document.getElementById("masPedidosBox").classList.remove("d-none");
  }
  document.getElementById("masPedidos").addEventListener("click", e => {
    const c = e.target.closest(".chip-favorito");
    if (c) abrirDetalle(c.dataset.id);
  });
})();


/* ---- Portada: carrusel automático (fotos en PORTADA, js/data.js) ---- */
(function portada() {
  const caja = document.getElementById("portada");
  if (!caja || !PORTADA.length) return;            // sin fotos se queda el banner de siempre
  const esc = (t) => String(t || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const n = PORTADA.length;

  caja.classList.add("activo");
  // Solo la primera foto carga de entrada; las demás cargan cuando la página ya terminó (más rápido)
  caja.innerHTML = PORTADA.map((p, i) => `
    <div class="slide${i === 0 ? " activa" : ""}" role="group" aria-roledescription="diapositiva" aria-label="${i + 1} de ${n}"${i ? ' aria-hidden="true"' : ""}>
      <img class="slide-fondo" ${i === 0 ? `src="${esc(p.foto)}"` : `data-src="${esc(p.foto)}"`} alt="" aria-hidden="true" decoding="async">
      <img class="slide-foto" ${i === 0 ? `src="${esc(p.foto)}" fetchpriority="high"` : `data-src="${esc(p.foto)}"`} alt="${esc(p.texto || "Pedido " + (i + 1))}" decoding="async">
      ${p.texto ? `<p class="slide-texto">${esc(p.texto)}</p>` : ""}
    </div>`).join("") + (n > 1 ? `
    <button type="button" class="portada-flecha ant" aria-label="Foto anterior">‹</button>
    <button type="button" class="portada-flecha sig" aria-label="Foto siguiente">›</button>
    <div class="portada-puntos">${PORTADA.map((_, i) =>
      `<button type="button" class="punto${i === 0 ? " activo" : ""}" data-i="${i}" aria-label="Ir a la foto ${i + 1}"></button>`).join("")}</div>` : "");

  const cargarResto = () => caja.querySelectorAll("img[data-src]").forEach(im => { im.src = im.dataset.src; im.removeAttribute("data-src"); });
  if (document.readyState === "complete") cargarResto(); else window.addEventListener("load", cargarResto);
  if (n < 2) return;

  const slides = caja.querySelectorAll(".slide");
  const puntos = caja.querySelectorAll(".punto");
  let actual = 0, timer = null, pausado = false;

  function ir(i) {
    actual = (i + n) % n;
    slides.forEach((s, k) => { s.classList.toggle("activa", k === actual); s.setAttribute("aria-hidden", k === actual ? "false" : "true"); });
    puntos.forEach((p, k) => p.classList.toggle("activo", k === actual));
  }
  const quieteMovimiento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function programar() {
    clearTimeout(timer);
    if (quieteMovimiento || pausado || document.hidden) return;
    timer = setTimeout(() => { ir(actual + 1); programar(); }, PORTADA_SEGUNDOS * 1000);
  }
  const mover = (i) => { ir(i); programar(); };

  caja.querySelector(".ant").addEventListener("click", () => mover(actual - 1));
  caja.querySelector(".sig").addEventListener("click", () => mover(actual + 1));
  caja.querySelector(".portada-puntos").addEventListener("click", e => {
    const p = e.target.closest(".punto");
    if (p) mover(Number(p.dataset.i));
  });

  // Se pausa mientras alguien la mira con el mouse o la enfoca con el teclado, y cuando la pestaña no está visible
  caja.addEventListener("mouseenter", () => { pausado = true; programar(); });
  caja.addEventListener("mouseleave", () => { pausado = false; programar(); });
  caja.addEventListener("focusin", () => { pausado = true; programar(); });
  caja.addEventListener("focusout", () => { pausado = false; programar(); });
  document.addEventListener("visibilitychange", programar);

  // Deslizar con el dedo
  let x0 = null;
  caja.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  caja.addEventListener("touchend", e => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 40) mover(actual + (dx < 0 ? 1 : -1));
  }, { passive: true });

  programar();
})();
