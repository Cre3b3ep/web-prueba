
function fechas() {
  var msegMinuto = 1000 * 60;
  var msegHora = msegMinuto * 60;
  var msegDia = msegHora * 24;
  var msegAnio = msegDia * 365;
  var nacimiento = new Date(1989, 1, 1);
  var hoy = new Date();
  var tiempo = hoy - nacimiento;

  // calcular años
  var anios = Math.floor(tiempo / msegAnio);
  tiempo = tiempo - (anios * msegAnio);

  //calcular días 
  var dias = Math.floor(tiempo / msegDia);
  tiempo = tiempo - (dias * msegDia);

  // //calcula horas
  // var horas = Math.floor(tiempo / msegHora)
  // tiempo = tiempo - (horas * msegHora)
  // var minutos = Math.floor(tiempo / msegMinuto)
  // tiempo = tiempo - (minutos * msegMinuto)

  document.getElementById("fecha").innerHTML = anios + " años," + " " + dias + " días,";
}

function mueveReloj() { 
  momentoActual = new Date();
  var segundos =momentoActual.getSeconds();
  var minuto = momentoActual.getMinutes();
  var hora = momentoActual.getHours();

  document.getElementById("segundos").innerHTML=hora + " horas" + ", " +minuto + " minutos" + " y"+ " " + segundos +" segundos" +" ";

  //La función se tendrá que llamar así misma para que sea dinámica, 
  //de esta forma:
  setTimeout(mueveReloj,6633)
}

function matterialize(){
  document.getElementById('materializecss').src="img/materialize-teal.png";
}
function gofonts(){
  document.getElementById('fonts').src="img/gf1.png";
}
function fawesome(){
  document.getElementById('fawesome').src="img/fntaw1.png";
}
function mati(){
  document.getElementById('mati').src="img/mati1.png";
}



// Recuento de enlaces externos con el atributo name en cada uno.
// console.log(document.anchors.length + " enlaces externos");

// function misEnlaces() {
//   var enlaces=document.getElementsByTagName("a");
//   console.log("Numero total de enlaces: "+enlaces.length);
//   }
// Necesita de  <body onload="misEnlaces();">
var anio = new Date(1988);

function mostrarEdad(){
  hoy = new Date();
  anioActual=hoy.getFullYear();
  edad=(anioActual+1900)-anio; 

  if(edad>1900){
    edad-=1900;
  }
document.getElementById("perro").innerHTML="Edad: "+edad+ " años.";
}
