
require('dotenv').config();
const axios = require('axios');
const polyline = require("polyline");
const request = require("request");
const { 
  isNullOrUndefinedOrEmpty,
  convertirDistancia,
  convertirTiempo
} = require ('../helpers/genericFunction.js');
require('dotenv').config();

//const key = "AIzaSyBI48y_lWLB-Jplq5ETGIJjEbqY3wkubIU";


const CasetasRutas = async (req = request, res = response) => {
  
  try {
       
    const jsonDatosCalculo =   req.body;
    let tipoCalculo = jsonDatosCalculo.calculationType

    if(isNullOrUndefinedOrEmpty(tipoCalculo))
    {
      throw  new Error("Debes ingresar el tipo de calculo valido");
    }


   // console.log(validarJSONCasetasRutas(jsonDatosCalculo));
   
   let validaCasetas = validarJSONCasetasRutas(jsonDatosCalculo);

    
    if(!validaCasetas.valid)
    {
      throw new Error(validaCasetas.message);
    }
    

    if(tipoCalculo == 1)
    {

      let origen = jsonDatosCalculo.from;
      let destino = jsonDatosCalculo.to;
     

      if(!origen)
      {
        throw  new Error("Debes ingresar el origen para poder calcular");
      }
  
      if(!destino)
      {
        throw  new Error("Debes ingresar el destino para poder calcular");
      }
  
      getRouteGoogle(jsonDatosCalculo).then((route) => {
        
        let DatosEnd = 
                       { 
                       "tolls":[],
                       "points": route[0].routeDecoded,
                       "costs" : [],
                       "summary" : route[0].summary                
                       }
       
        res.json(DatosEnd);
       
              // datos = body;
          // Puedes usar la ruta codificada con bibliotecas de mapas como Google Maps JavaScript API para dibujar la ruta en un mapa.
        }).catch((error) => {
          // Maneja el error, si es necesario

          res.json({"error": error.message});

        });

    }

    if (tipoCalculo == 2) {


      const requestOptions = {
        url: process.env.API_URL_ROOT_TOLLGURU +`/origin-destination-waypoints`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key':  process.env.APLICATION_KEY_TOLLGURU  // Reemplaza con tu clave de API
        },
        json: true,
        body: jsonDatosCalculo
      };
      

    

        request(requestOptions, (error, response, body) => {
          if (error) {

             throw  new Error("Error en la solicitud: "+ error);

           // console.error('Error en la solicitud:', error);
          } else {
          console.log('Respuesta de la API:', body);
        //  console.log(body.routes[0].tolls);

      
                
        if (body.status == "OK")
        {

          const DatosRutas = body.routes[0].tolls.map(caseta => ({
            lat: caseta.lat,
            lng: caseta.lng,
            name: caseta.name,
            road: caseta.road,
            state: caseta.state,
            country: caseta.country,
            type: caseta.type,
            cashCost: caseta.cashCost

        }));

       

          res.json({
            "tolls": DatosRutas,
            "points" : polyline.decode(body.routes[0].polyline), 
            "costs" : [body.routes[0].costs],
            "summary" :[ body.routes[0].summary]
          });

        } else{    

          let messageerror = body.message !== undefined ? body.message : body.value ;// + " " + body.value
          res.json({"error": messageerror });
        }
    
      }
        })
      

    }

  } catch (e) {

    res.json({"error": e.message});

  }
}
  

  async function getRouteGoogle(jsonDatosCalculo) {
    try {

      console.log(jsonDatosCalculo);

     // const waypoints  = jsonDatosCalculo.wayPoints.map(waypoint => [waypoint.lat, waypoint.lng]);
      const waypoints = jsonDatosCalculo.waypoints.map(location => `${location.lat},${location.lng}`).join('|');

      console.log(waypoints)

//  console.log(`${jsonDatosCalculo.from.lat},${jsonDatosCalculo.from.lng}`)
console.log(process.env.API_URL_ROOT_GOOGLE);
      const response = await axios.get(process.env.API_URL_ROOT_GOOGLE, {
        params: {
          origin: `${jsonDatosCalculo.from.lat},${jsonDatosCalculo.from.lng}`,
          destination: `${jsonDatosCalculo.to.lat},${jsonDatosCalculo.to.lng}`,
          waypoints: waypoints,
          key: process.env.APLICATION_KEY_GOOGLE
        }
      });
  
      console.log("hola")
     console.log(response.data);


      if(!isNullOrUndefinedOrEmpty(response.data.error_message))
      {
        throw  new Error(response.data.error_message);
      }

      const routeEncoded = response.data.routes[0].overview_polyline.points;
      const routeDecoded = polyline.decode(routeEncoded);

      const ruta = response.data.routes[0];

      
      const distanciaMetros = ruta.legs.reduce((acumulador, leg) => acumulador + leg.distance.value, 0);
      const tiempoSegundos = ruta.legs.reduce((acumulador, leg) => acumulador + leg.duration.value, 0);

      let summary = [
        {
            "hasTolls": null,
            "hasExpressTolls": null,
            "diffs": {
                "cheapest": null,
                "fastest": null
            },
            "url": null,
            "distance": {
                "text": convertirDistancia(distanciaMetros,"mi"),
                "metric": convertirDistancia(distanciaMetros,"km"),//"249 km",
                "value": distanciaMetros
            },
            "duration": {
                "text": convertirTiempo(tiempoSegundos),//"4 h 44 min",
                "value": tiempoSegundos
            },
            "name": null
        }
    ]

      //console.log(routeDecoded);
      //return routeDecoded;
      return [{"PointsEncode": routeEncoded, "routeDecoded": routeDecoded, "DatosCompletos": [response.data],"summary": summary }];
    } catch (error) {
     // console.error(`Error obteniendo la información: ${error.message}`);
     throw  new Error(error.message);
     // throw error;
    }
  }
  

  function validarJSONCasetasRutas(json) {
    // Verificar la presencia de atributos
    if (!json) {
      return {message: "El JSON está vacío.", valid: false};
    }
  
    const requiredAttributes = [
      "from",
      "to",
      "waypoints",
      "calculationType"
    ];
  
    for (const attribute of requiredAttributes) {
      if (!json.hasOwnProperty(attribute)) {
        return {message:`Falta el atributo "${attribute}" en el JSON.`, valid:false};
      }
    }

      // Validar la existencia de from, to y al menos un registro en waypoints
  if (!json.from) {
    return { message: "Falta el atributo 'from' en el JSON.", valid: false };
  }

  if (!json.to) {
    return { message: "Falta el atributo 'to' en el JSON.", valid: false };
  }

  if (!json.waypoints || json.waypoints.length === 0) {
    return { message: "Falta al menos un registro en 'waypoints' en el JSON.", valid: false };
  }

  
    const validateCoordinates = (coordinates, prefix) => {
      if (
        typeof coordinates.lat !== "number" ||
        typeof coordinates.lng !== "number"
      ) {
        return {message:`Las coordenadas (${prefix}.lat, ${prefix}.lng) deben ser números.`, valid:false};
      }
      return null;
    };
  
    const fromError = validateCoordinates(json.from, "from");
    if (fromError) {
      return fromError;
    }
  
    const toError = validateCoordinates(json.to, "to");
    if (toError) {
      return toError;
    }
  
    for (let i = 0; i < json.waypoints.length; i++) {
      const waypointError = validateCoordinates(
        json.waypoints[i],
        `waypoints[${i}]`
      );
      if (waypointError) {
        return waypointError;
      }
    }
  
    return {message:"El JSON es válido.", valid:true};
  }

  module.exports = {CasetasRutas}
  
