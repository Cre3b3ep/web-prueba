'use strict';

// Fecha de referencia del contador "Hace ya ..." (Tim Berners-Lee en el CERN).
// OJO: en JavaScript los meses empiezan en 0 -> (1989, 1, 1) es el 1 de FEBRERO de 1989.
var INICIO_WEB = new Date(1989, 1, 1);

// Descompone el tiempo transcurrido desde `inicio` en años, días, horas, minutos y segundos.
// Los años se cuentan por calendario (respeta los bisiestos) en lugar de 365 días fijos.
function tiempoDesde(inicio, ahora) {
  var anios = ahora.getFullYear() - inicio.getFullYear();
  var aniversario = new Date(inicio);
  aniversario.setFullYear(inicio.getFullYear() + anios);
  if (aniversario > ahora) {
    anios--;
    aniversario.setFullYear(inicio.getFullYear() + anios);
  }

  var resto = Math.floor((ahora - aniversario) / 1000); // en segundos
  var segundos = resto % 60;
  resto = Math.floor(resto / 60);
  var minutos = resto % 60;
  resto = Math.floor(resto / 60);
  var horas = resto % 24;
  var dias = Math.floor(resto / 24);

  return { anios: anios, dias: dias, horas: horas, minutos: minutos, segundos: segundos };
}

// Pinta el contador en #fecha y #segundos si la página los tiene.
function mueveReloj() {
  var fecha = document.getElementById('fecha');
  var reloj = document.getElementById('segundos');
  if (!fecha || !reloj) {
    return; // esta página no tiene contador
  }

  var t = tiempoDesde(INICIO_WEB, new Date());
  fecha.textContent = t.anios + ' años, ' + t.dias + ' días,';
  reloj.textContent = t.horas + ' horas, ' + t.minutos + ' minutos y ' + t.segundos + ' segundos ';

  // La función se vuelve a llamar a sí misma cada segundo para que sea dinámica
  setTimeout(mueveReloj, 1000);
}

// Logos del pie: al pasar el ratón (o llegar con el teclado) se muestra la versión en color.
// La imagen alternativa se indica en el HTML con data-hover-src.
function activarLogos() {
  var logos = document.querySelectorAll('img[data-hover-src]');
  Array.prototype.forEach.call(logos, function (img) {
    var cambiar = function () {
      img.src = img.getAttribute('data-hover-src');
    };
    img.addEventListener('mouseenter', cambiar, { once: true });
    if (img.parentElement) {
      img.parentElement.addEventListener('focus', cambiar, { once: true });
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  mueveReloj();
  activarLogos();
});

// Recuento de enlaces externos con el atributo name en cada uno.
// console.log(document.anchors.length + " enlaces externos");

// function misEnlaces() {
//   var enlaces=document.getElementsByTagName("a");
//   console.log("Numero total de enlaces: "+enlaces.length);
//   }
// Necesita de  <body onload="misEnlaces();">
