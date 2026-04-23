// assets/js/videos.js
// Importa desde tu firebase-config.js existente
import { db } from './firebase-config.js';
import {
  collection, getDocs, query, orderBy
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ── Estado global ─────────────────────────────────────────────
let todosLosVideos = [];
let categoriaActiva = 'todos';

// ── Elementos DOM ─────────────────────────────────────────────
const grid        = document.getElementById('grid');
const filtrosEl   = document.getElementById('filtros');
const contadorEl  = document.getElementById('contador');
const cargandoEl  = document.getElementById('cargando');
const sinResEl    = document.getElementById('sin-resultados');

// ── Carga desde Firestore ──────────────────────────────────────
async function cargarVideos() {
  try {
    const q = query(collection(db, 'videos_epp'), orderBy('orden', 'asc'));
    const snap = await getDocs(q);
    todosLosVideos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    cargandoEl.style.display = 'none';
    generarFiltros();
    renderizar('todos');
  } catch (err) {
    cargandoEl.textContent = 'Error al cargar videos. Intenta más tarde.';
    console.error('Firestore error:', err);
  }
}

// ── Genera botones de filtro dinámicamente ─────────────────────
function generarFiltros() {
  const cats = [...new Set(todosLosVideos.map(v => v.categoria))].sort();
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filtro-btn';
    btn.dataset.cat = cat;
    btn.textContent = cat;
    btn.onclick = () => activarFiltro(cat, btn);
    filtrosEl.appendChild(btn);
  });
}

// ── Activa filtro ─────────────────────────────────────────────
function activarFiltro(cat, btn) {
  categoriaActiva = cat;
  document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('activo'));
  btn.classList.add('activo');
  renderizar(cat);
}

// Listener del botón "Todos" (ya existe en HTML)
document.querySelector('[data-cat="todos"]').onclick = function() {
  activarFiltro('todos', this);
};

// ── Renderiza grid ─────────────────────────────────────────────
function renderizar(cat) {
  const lista = cat === 'todos'
    ? todosLosVideos
    : todosLosVideos.filter(v => v.categoria === cat);

  grid.innerHTML = '';
  contadorEl.textContent = `${lista.length} video${lista.length !== 1 ? 's' : ''}`;

  if (lista.length === 0) {
    sinResEl.style.display = 'block';
    return;
  }
  sinResEl.style.display = 'none';

  lista.forEach(v => {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.innerHTML = `
      <div class="thumb-wrap">
        <img
          src="https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg"
          alt="${v.titulo}"
          loading="lazy"
          onerror="this.style.opacity='0'"
        >
        <div class="play-overlay">
          <svg viewBox="0 0 10 10"><polygon points="2,1 9,5 2,9"/></svg>
        </div>
      </div>
      <div class="card-info">
        <span class="categoria-tag">${v.categoria}</span>
        <div class="card-titulo">${v.titulo}</div>
        <div class="card-fuente">${v.fuente || ''}</div>
      </div>
    `;
    card.onclick = () => abrirModal(v);
    grid.appendChild(card);
  });
}

// ── Modal ──────────────────────────────────────────────────────
function abrirModal(v) {
  document.getElementById('modal-titulo').textContent = v.titulo;
  document.getElementById('modal-desc-texto').textContent = v.descripcion || '';
  document.getElementById('modal-iframe').src =
    `https://www.youtube.com/embed/${v.youtubeId}?autoplay=1`;
  document.getElementById('modal-yt-link').href =
    `https://www.youtube.com/watch?v=${v.youtubeId}`;
  document.getElementById('modal').classList.add('abierto');
}

window.cerrarModal = function() {
  document.getElementById('modal').classList.remove('abierto');
  document.getElementById('modal-iframe').src = '';
};

window.cerrarModalClick = function(e) {
  if (e.target === document.getElementById('modal')) cerrarModal();
};

// Cerrar con Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') cerrarModal();
});

// ── Iniciar ────────────────────────────────────────────────────
cargarVideos();
