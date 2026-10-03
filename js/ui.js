'use strict';

// Comportamiento de la interfaz, sin librerías (sustituye a Materialize).
// Cada pieza sólo se activa si la página tiene los elementos que necesita.
//
// El JS sólo cambia ESTADOS; el aspecto lo decide css/style.css:
//   [data-abierto]   → desplegable, menú lateral o botonera abiertos
//   aria-expanded    → el botón que los abre dice si están abiertos
//   [data-parallax]  → banner con desplazamiento de la foto
// Los textos que vienen del HTML (data-caption...) se insertan siempre con
// textContent, nunca con innerHTML: así no pueden inyectar código.

var reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');

// Los enlaces que hacen de botón llevan href="#!" o "javascript:void(0)":
// se les da el papel de botón para teclado y lectores de pantalla.
function comoBoton(el, controla) {
  el.setAttribute('role', 'button');
  el.setAttribute('aria-expanded', 'false');
  if (controla) el.setAttribute('aria-controls', controla);
  if (!el.hasAttribute('href')) el.setAttribute('tabindex', '0');
  // role="button" se activa también con la barra espaciadora
  el.addEventListener('keydown', function (e) {
    if (e.key === ' ') {
      e.preventDefault();
      el.click();
    }
  });
}

/* ---------------------------------------------------------------------------
   Desplegables del menú (HTML, CSS, JS...)
   El botón lleva data-target="dropdownN" y la lista está fuera del <nav>,
   así que se coloca a mano debajo del botón al abrirla.
   --------------------------------------------------------------------------- */
function activarDesplegables() {
  var abierto = null; // { boton, lista }

  function cerrar(devolverFoco) {
    if (!abierto) return;
    abierto.lista.removeAttribute('data-abierto');
    abierto.boton.setAttribute('aria-expanded', 'false');
    if (devolverFoco) abierto.boton.focus();
    abierto = null;
  }

  function abrir(boton, lista) {
    var r = boton.getBoundingClientRect();
    lista.style.minWidth = r.width + 'px';
    lista.setAttribute('data-abierto', '');
    // coordenadas de página (la lista es position: absolute respecto al documento)
    var izquierda = Math.min(r.left, document.documentElement.clientWidth - lista.offsetWidth - 8);
    lista.style.left = Math.max(8, izquierda) + window.scrollX + 'px';
    lista.style.top = r.bottom + window.scrollY + 'px';
    boton.setAttribute('aria-expanded', 'true');
    abierto = { boton: boton, lista: lista };
  }

  document.querySelectorAll('.desplegable-boton[data-target]').forEach(function (boton) {
    var lista = document.getElementById(boton.getAttribute('data-target'));
    if (!lista) return;
    comoBoton(boton, lista.id);
    boton.addEventListener('click', function (e) {
      e.preventDefault();
      var eraEste = abierto && abierto.boton === boton;
      cerrar(false);
      if (!eraEste) abrir(boton, lista);
    });
  });

  // Cerrar: clic fuera, Escape, o el foco se va a otra parte
  document.addEventListener('click', function (e) {
    if (abierto && !abierto.boton.contains(e.target) && !abierto.lista.contains(e.target)) cerrar(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') cerrar(true);
  });
  document.addEventListener('focusin', function (e) {
    if (abierto && !abierto.boton.contains(e.target) && !abierto.lista.contains(e.target)) cerrar(false);
  });
  window.addEventListener('resize', function () { cerrar(false); });
}

/* ---------------------------------------------------------------------------
   Menú lateral (móvil)
   --------------------------------------------------------------------------- */
function activarMenuLateral() {
  var boton = document.querySelector('.menu-boton[data-target]');
  var menu = boton && document.getElementById(boton.getAttribute('data-target'));
  if (!menu) return;

  comoBoton(boton, menu.id);
  if (!boton.hasAttribute('aria-label')) boton.setAttribute('aria-label', 'Abrir menú');

  // Capa oscura detrás del menú: al pulsarla se cierra
  var capa = document.createElement('div');
  capa.className = 'menu-capa';
  capa.hidden = true;
  document.body.appendChild(capa);

  function abrir() {
    menu.setAttribute('data-abierto', '');
    boton.setAttribute('aria-expanded', 'true');
    capa.hidden = false;
    document.body.style.overflow = 'hidden';
    var primero = menu.querySelector('a[href]');
    if (primero) primero.focus();
  }

  function cerrar() {
    if (!menu.hasAttribute('data-abierto')) return;
    menu.removeAttribute('data-abierto');
    boton.setAttribute('aria-expanded', 'false');
    capa.hidden = true;
    document.body.style.overflow = '';
    boton.focus();
  }

  boton.addEventListener('click', function (e) {
    e.preventDefault();
    if (menu.hasAttribute('data-abierto')) cerrar(); else abrir();
  });
  capa.addEventListener('click', cerrar);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') cerrar();
  });
  // Al elegir una sección del propio menú (anclas de la misma página)
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a[href]')) cerrar();
  });
}

/* ---------------------------------------------------------------------------
   Botonera flotante: se abre sola con el ratón (CSS :hover) y con el
   teclado (:focus-within). El JS sólo hace que el botón principal sea
   alcanzable con el teclado y que en pantallas táctiles abra con un toque.
   --------------------------------------------------------------------------- */
function activarBotonera() {
  document.querySelectorAll('.botonera-flotante').forEach(function (botonera) {
    var principal = botonera.querySelector(':scope > a');
    if (!principal) return;
    comoBoton(principal);
    if (!principal.hasAttribute('aria-label')) principal.setAttribute('aria-label', 'Accesos rápidos');
    principal.addEventListener('click', function (e) {
      e.preventDefault();
      var abrir = !botonera.hasAttribute('data-abierto');
      botonera.toggleAttribute('data-abierto', abrir);
      principal.setAttribute('aria-expanded', String(abrir));
    });
    document.addEventListener('click', function (e) {
      if (!botonera.contains(e.target)) {
        botonera.removeAttribute('data-abierto');
        principal.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

/* ---------------------------------------------------------------------------
   Visor de imágenes: <dialog> nativo para las img.ampliable.
   El navegador ya se encarga del foco, de Escape y de bloquear el fondo.
   --------------------------------------------------------------------------- */
function activarVisor() {
  var imagenes = document.querySelectorAll('img.ampliable');
  if (!imagenes.length || typeof HTMLDialogElement !== 'function') return;

  var visor = document.createElement('dialog');
  visor.className = 'visor';
  visor.setAttribute('aria-label', 'Imagen ampliada');
  var figura = document.createElement('figure');
  var grande = document.createElement('img');
  var pie = document.createElement('figcaption');
  figura.append(grande, pie);
  visor.append(figura);
  document.body.appendChild(visor);

  var origen = null;
  // Un clic en cualquier parte (imagen o fondo) cierra
  visor.addEventListener('click', function () { visor.close(); });
  visor.addEventListener('close', function () {
    if (origen) origen.focus();
  });

  imagenes.forEach(function (img) {
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.setAttribute('aria-haspopup', 'dialog');

    function abrir() {
      origen = img;
      grande.src = img.currentSrc || img.src;
      grande.alt = img.alt;
      pie.textContent = img.getAttribute('data-caption') || '';
      pie.hidden = !pie.textContent;
      visor.showModal();
    }
    img.addEventListener('click', abrir);
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        abrir();
      }
    });
  });
}

/* ---------------------------------------------------------------------------
   Parallax: la foto del banner se desplaza más despacio que la página.
   No se activa si el sistema pide reducir el movimiento.
   --------------------------------------------------------------------------- */
function activarParallax() {
  if (reducirMovimiento.matches) return;
  var banners = Array.prototype.filter.call(document.querySelectorAll('.banner'), function (b) {
    return b.querySelector('.banner-imagen img');
  });
  if (!banners.length) return;

  banners.forEach(function (b) { b.setAttribute('data-parallax', ''); });

  var pendiente = false;
  function actualizar() {
    pendiente = false;
    var alto = window.innerHeight;
    banners.forEach(function (b) {
      var r = b.getBoundingClientRect();
      if (r.bottom < 0 || r.top > alto) return; // fuera de pantalla: no se calcula
      // progreso de 0 (entra por abajo) a 1 (sale por arriba)
      var progreso = (alto - r.top) / (alto + r.height);
      b.style.setProperty('--parallax', ((progreso - 0.5) * 0.4 * r.height).toFixed(1) + 'px');
    });
  }
  // requestAnimationFrame: como mucho un cálculo por fotograma, no uno por evento
  function pedir() {
    if (!pendiente) {
      pendiente = true;
      requestAnimationFrame(actualizar);
    }
  }
  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  actualizar();
}

document.addEventListener('DOMContentLoaded', function () {
  activarDesplegables();
  activarMenuLateral();
  activarBotonera();
  activarVisor();
  activarParallax();
});
