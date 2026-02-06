function mostrarEdad(){
  var dia = 11;
  var mes = 5;
  var anio =1988;

  hoy = new Date();
  anioActual=hoy.getFullYear();
  mesActual=hoy.getMonth();
  diaActual=hoy.getDate();
  horaActual=hoy.getHours();
  minutoActual=hoy.getMinutes();
  segundoActual=hoy.getSeconds();

  edad=(anioActual+1900)-anio;
  if(mesActual<(mes-1)){
    edad--;
  }
  if(((mes-1)==mesActual)&&(diaActual<dia)){
    edad--;
  }
  if(edad>1900){
    edad-=1900;
  }
document.getElementById("perro").innerHTML="Tengo " + edad+ " años, " + mesActual + " meses " + horaActual + " horas " + minutoActual + " minutos y " + segundoActual+ " segundos." ;
}







//validar meses con su respectivo número de días.↓↓↓↓↓↓↓↓

// if ((mm<1) || (mm>12) || (dd<1) || (dd>31) || (yy<1) ||(mm=="") || (dd=="") || (yy==""))  main="No es correcto" 
// 	else if (((mm==4) || (mm==6) || (mm==9) || (mm==11)) && (dd>30)) main="No es correcto"
// 	else if (mm==2) {
// 		if (dd>29)main="No es correcto" 
// 		else if((dd>28) && (!lyear(yy)))   main="No es correcto"
// 	}
// 	else if((yy>9999)||(yy<0)) main="No es correcto"
// 	else main=main