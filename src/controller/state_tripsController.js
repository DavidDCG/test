const { segundosAFormato, 
        calcularDiferenciaDeFechas, 
        restarHorasAFecha,
        milisegundosAFormatoTiempo,
        sumarHorasAFecha,
        limitarHora
      } = require ('../helpers/genericFunction.js');
const {DatosConexion} = require('../../config/connection.js');
require('dotenv').config();



const obtenerDatosStateTrips = async(POSITRACE_CONFIG, placa, fechaInicio, fechaFinal, cuenta)=>{


  const axios = require('axios');
  
  //console.log(POSITRACE_CONFIG)
  const tokensExistentes = POSITRACE_CONFIG.tokensExistentes;
  
 // console.log(tokensExistentes);

  var tokenValid = tokensExistentes.find(function(elemento) {
    return (elemento.name).trim() === (cuenta).trim();
  });


  var placaEncontrada;
  //var tokenValid;

  var instanceUnidad = axios.create({
    baseURL: POSITRACE_CONFIG.api_url_root +`/equipment/base_list`,
    headers: { 
        "Accept": "application/json",
        "X-Auth-Token": tokenValid.token,
        "Content-Type": "application/json"
    }
})

var respUnidades = await instanceUnidad.get();
var unidades = respUnidades.data.equipment;

//console.log(unidades);

 placaEncontrada =  unidades.find(function(elemento) {
  return (elemento.name).trim() === (placa).trim();
});


console.log(placaEncontrada);

 //unidades.find(item => item.name === placa);

 if(placaEncontrada)
{

  tokenValid = tokenValid.token;
  console.log("placa encontrada");

}

//console.log(placaEncontrada.id)

if(placaEncontrada.name == undefined){
 
  throw  new Error("Esta placa no esta asociada a una cuenta.");
  
}

//let ADD_TIME = process.env.ADD_TIME
//console.log(ADD_TIME);
var fechaModFinal = sumarHorasAFecha(fechaFinal, 6);

//console.log(fechaModFinal);

const instance_Datos_Vehiculo = axios.create({
    baseURL: POSITRACE_CONFIG.api_url_root +`/state_trips`,
    headers: { 
        "Accept": "application/json",
        "X-Auth-Token": tokenValid,
        "Content-Type": "application/json"
    },
    params: {
      ['filters[entity_type]'] :  "equipment",
      ['filters[entity_id]']   :  placaEncontrada.id,
      ['filters[start_date]']  :  fechaInicio,
      ['filters[end_date]']    :  fechaModFinal
    }

})

const resp_State_Trips = await instance_Datos_Vehiculo.get();
let state_Trips = resp_State_Trips.data; 

// Filtrar los state_trips con distancia mayor a cero
let stateTripsConDistanciaMayorACero = state_Trips.state_trips.filter(trip => trip.distance > 0);

// Crear un nuevo objeto JSON con los resultados
const JSONUsoVehiculos = {
  "state_trips": stateTripsConDistanciaMayorACero.map(trip => ({
      "name": trip.equipment.name,
      "distance": trip.distance === null ? 0: trip.distance/1000,
     // "start_date_original": trip.start_date,
      "start_date": restarHorasAFecha(trip.start_date, 6),
     // "end_date_original": trip.end_date,
      "end_date":  restarHorasAFecha(trip.end_date, 6),
     // "stop_duration": trip.stop_duration,
     // "stop_duration_mili": milisegundosAFormatoTiempo(trip.stop_duration),
      "stop_duration": limitarHora(segundosAFormato( trip.stop_duration === null ? 0: trip.stop_duration)),
      "stop_duration_ORIGINAL": trip.stop_duration,
      "driving_time": limitarHora(calcularDiferenciaDeFechas(trip.start_date, trip.end_date)),
      "address": trip.address === null? '': ( trip.address.city  + ' '
      + trip.address.state_and_country + ' '
      + trip.address.zipcode  + ' '
      + trip.address.apartment  + ' '
      + trip.address.street  + ' ')
  }))
};


//fitro por desfase de horas 

//const objetosFiltrados = JSONUsoVehiculos.state_trips.filter(trip => trip.start_date >= fechaInicio);
const objetosFiltrados = JSONUsoVehiculos.state_trips.filter(trip => {
  
  return trip.start_date >= fechaInicio && trip.start_date  <= fechaFinal;
});


return  objetosFiltrados; //resp_State_Trips.data; 
        // objetosFiltrados;
        //JSONUsoVehiculos.state_trips;
        

}


const obtenerPlacasCuenta = async(POSITRACE_CONFIG)=>{

  const axios = require('axios');
   const tokensExistentes = POSITRACE_CONFIG.tokensExistentes;
  
   var placasCuenta = [];
 
   for (const item of tokensExistentes) {
    

    var instanceUnidad = axios.create({
     baseURL: POSITRACE_CONFIG.api_url_root +`/equipment/base_list`,
     headers: { 
         "Accept": "application/json",
         "X-Auth-Token": item.token,
         "Content-Type": "application/json"
     }
 })
 
 
 var respUnidades = await instanceUnidad.get();
 var unidades = respUnidades.data.equipment;

 //console.log(unidades);


 // Recorre el arreglo original y agrega las propiedades deseadas al nuevo arreglo
for (const elemento of unidades) {
  placasCuenta.push({
      "name": elemento.name,
      "account_id": elemento.account_id,
      "cuenta": item.name,
      "token": item.token,
      "id": elemento.id
  });
}


}



return  placasCuenta; 
      
}

const Obtener_state_trips = async (req = request, res = response) => {
  
  
    try {
     
      let token = req.query.token;
      let fechaInicio = req.query.fechaInicio;//"2023-08-30T00:01:00Z";
      let fechaFinal =  req.query.fechaFinal;//"2023-08-30T23:59:59Z";
      let placa = req.query.placa;
      let opc = req.query.opcion;
      let cuenta = req.query.cuenta;
      var POSITRACE_CONFIG = await DatosConexion(token,cuenta);
      
      
  
      if (!POSITRACE_CONFIG.valid)
      {
        throw  new Error(POSITRACE_CONFIG.message);
      }
  
      if (!opc){
        throw  new Error("Ingrese tipo de opción válida.");
      }

      if(opc == 1)

      {

        if (!fechaInicio){
          throw  new Error("Ingresa fecha de inicio válida.");
        }
        if (!fechaFinal){
          throw  new Error("Ingresa fecha final válida.");
        }
        if (!placa){
          throw  new Error("Ingresa placa a buscar.");
        }

        if (!cuenta){
          throw  new Error("Ingrese una cuenta para esta placa.");
        }

      }

      
      let datosReturn;

     if(opc == 1 )
     {
      datosReturn = await obtenerDatosStateTrips(POSITRACE_CONFIG, placa, fechaInicio, fechaFinal,cuenta);
      res.json(datosReturn);

     } 
     else if(opc == 2)         
      {
        datosReturn = await obtenerPlacasCuenta(POSITRACE_CONFIG);
        res.json(datosReturn);
      }
     else {
      res.json({"message": "Sin datos para mostrar"});
     }

  } catch (e) {

    res.json({"error": e.message}); 
  }


}



module.exports = {Obtener_state_trips}
