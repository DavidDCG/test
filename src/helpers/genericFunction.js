
require('dotenv').config();

function segundosAFormato(segundos) {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segundosRestantes = segundos % 60;
    
    const formato = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundosRestantes).padStart(2, '0')}.000`;
    
    return formato;
  }


  
  function milisegundosAFormatoTiempo(milisegundos) {
    // Calcula las partes del tiempo
    let horas = Math.floor(milisegundos / 3600000);
    let minutos = Math.floor((milisegundos % 3600000) / 60000);
    let segundos = Math.floor((milisegundos % 60000) / 1000);
    let milisegundosRestantes = milisegundos % 1000;
  
    // Formatea las partes en el formato deseado
    let formatoHoras = horas.toString().padStart(2, '0');
    let formatoMinutos = minutos.toString().padStart(2, '0');
    let formatoSegundos = segundos.toString().padStart(2, '0');
    let formatoMilisegundos = milisegundosRestantes.toString().padStart(3, '0');
  
    // Construye la cadena de tiempo
    let tiempoFormateado = `${formatoHoras}:${formatoMinutos}:${formatoSegundos}.${formatoMilisegundos}`;
  
    return tiempoFormateado;
  }
  
  
  function calcularDiferenciaDeFechas(fechaA, fechaB) {
  
    try {
    // Convierte las fechas en objetos Date
    let fechaInicio = new Date(fechaA);
    let fechaFin = new Date(fechaB);
  
    // Calcula la diferencia en milisegundos
    let diferenciaMs = fechaFin - fechaInicio;
  
    // Convierte la diferencia en el formato deseado "HH:mm:ss.fff"
    let horas = Math.floor(diferenciaMs / 3600000);
    diferenciaMs %= 3600000;
    let minutos = Math.floor(diferenciaMs / 60000);
    diferenciaMs %= 60000;
    let segundos = Math.floor(diferenciaMs / 1000);
    let milisegundos = diferenciaMs % 1000;
  
    //
    let resultado = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}.${String(milisegundos).padStart(3, '0')}`;  
    
    return resultado;
  
  
    }  catch (e) {
  
    console.log(e);
    }
  
}


function restarHorasAFecha(fechaISO, horasARestar) {
  // Convierte la cadena de fecha ISO a un objeto de fecha
  const fecha = new Date(fechaISO);

  // Resta las horas especificadas
  fecha.setHours(fecha.getHours() - horasARestar);

  // Devuelve la nueva fecha en formato ISO 8601
  return fecha.toISOString();
}


function sumarHorasAFecha(fechaString, horasASumar) {
  const fecha = new Date(fechaString);
    fecha.setHours(fecha.getHours() + horasASumar);
    return fecha.toISOString();
}


function limitarHora(hora) {
  // Parsear la hora en formato HH:mm:ss.fff a un objeto Date
  const horaDate = new Date(`2000-01-01T${hora}`);

  // Crear un objeto Date para "23:59:59.000"
  const limite = new Date(`2000-01-01T23:59:59.000`);

  // Comparar las horas
  if (horaDate < limite) {
      return hora;
  } else {
      // Si la hora ingresada es válida, devolverla sin cambios
      return "23:59:59.000";
  }
}


function isNullOrUndefinedOrEmpty(value) {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0);
}



function validarFormatoFechaPositracer(fechaString) {
  // Expresión regular para el formato de fecha proporcionado
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  // Validar la cadena con la expresión regular
  return regex.test(fechaString);
}


function convertirDistancia(distanciaMetros, unidad) {
  const FACTOR_KM_A_MILLAS = 0.621371;
  if (unidad.toLowerCase() === 'km') {
    // Convertir metros a kilómetros
    const distanciaKm = distanciaMetros / 1000;
    return `${distanciaKm.toFixed(2)} km`;
  } else if (unidad.toLowerCase() === 'mi') {
    // Convertir metros a millas
    const distanciaMillas = distanciaMetros * FACTOR_KM_A_MILLAS / 1000;
    return `${distanciaMillas.toFixed(2)} mi`;
  } else {
    return 'Unidad no válida. Utiliza "km" o "mi".';
  }
}



function convertirTiempo(segundos) {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);

  return `${horas} h ${minutos} min`;
}

module.exports = {
    segundosAFormato, 
    milisegundosAFormatoTiempo,
    calcularDiferenciaDeFechas,
    restarHorasAFecha,
    sumarHorasAFecha,
    limitarHora,
    isNullOrUndefinedOrEmpty,
    validarFormatoFechaPositracer,
    convertirDistancia,
    convertirTiempo
}