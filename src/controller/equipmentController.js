const {
  restarHorasAFecha,
  validarFormatoFechaPositracer,
  sumarHorasAFecha,
  isNullOrUndefinedOrEmpty,
  convertirTiempo
} = require('../helpers/genericFunction.js');
require('dotenv').config();
const { DatosConexion } = require('../../config/connection.js');

const ObtenerRegistroEventosPointsV2 = async (POSITRACE_CONFIG, id_placa, cuenta, start_date, end_date) => {
  const axios = require('axios');
  //console.log(POSITRACE_CONFIG)
  const tokensExistentes = POSITRACE_CONFIG.tokensExistentes;
  // console.log(tokensExistentes);
  var tokenValid = tokensExistentes.find(function (elemento) {
    return (elemento.name).trim() === (cuenta).trim();
  });
  var instancePointsEvents = axios.create({
    baseURL: POSITRACE_CONFIG.api_url_root + `/points`,
    headers: {
      "Accept": "application/json",
      "X-Auth-Token": tokenValid.token,
      "Content-Type": "application/json"
    },
    params: {
      ['filters[entity_type]']: "equipment",
      ['filters[entity_id]']: id_placa,// placaEncontrada.id,
      ['filters[start_date]']: start_date,
      ['filters[end_date]']: end_date
    }
  })
  var instancePointsEvents = await instancePointsEvents.get();
  instancePointsEvents = instancePointsEvents.data;
  let instanceEvents = axios.create({
    baseURL: POSITRACE_CONFIG.api_url_root + `/event_types`,
    headers: {
      "Accept": "application/json",
      "X-Auth-Token": tokenValid.token,
      "Content-Type": "application/json",
      "Locate-Accept-Language": "es"
    },
    params: {
      ['page']: 1,
      ['per_page']: 200,
      ['sort_by']: 'id',
      ['sort']: 'DESC'
    }
  })
  let instanceEventsGet = await instanceEvents.get();
  instanceEventsGet = instanceEventsGet.data;
  // console.log(instanceEventsGet);
  // Filtrar los registros donde "events" no sea una lista vacía
  var filteredPoints = instancePointsEvents.points.filter(function (point) {
    return point.events.length > 0;
  });
  // Crear una nueva lista con los atributos necesarios de "points"
  var resultfilterPoints = filteredPoints.map(function (point) {
    if (!point.is_invalid) {
      return {
        id: point.id,
        time: restarHorasAFecha(point.time, parseInt(process.env.ADD_TIME)),
        gps: point.gps,
        events: point.events.map(function (event) {
          return {
            id: event.type.id,
            name: instanceEventsGet.event_types.find(evento => evento.id === event.type.id).name,
            start_date: restarHorasAFecha(event.event.start_date, parseInt(process.env.ADD_TIME)),
            end_date: !isNullOrUndefinedOrEmpty(event.event.end_date) ? restarHorasAFecha(event.event.end_date, parseInt(process.env.ADD_TIME)) : restarHorasAFecha(event.event.start_date, parseInt(process.env.ADD_TIME)),
            stop_duration: !isNullOrUndefinedOrEmpty(event.event.stop_duration) ? event.event.stop_duration : 0
          };
        })
      };
    }
  });
  const validIds = [1, 2, 8, 9, 10, 12, 21, 22, 30, 33, 39, 77, 107, 108];
  let totalTiempoInactividad = 0;
  // Filtrar events con id existente en validIds
  const filteredEvents = resultfilterPoints.reduce((acc, obj) => {
    const filteredEvents = obj.events.filter(event => validIds.includes(event.id));
    // Formatear la fecha y quitar milisegundos y segundos
    const formattedEvents = filteredEvents.map(event => {
      const formattedDate = new Date(event.start_date);
      formattedDate.setSeconds(0);
      formattedDate.setMilliseconds(0);
      if (event.id == 1) {
        totalTiempoInactividad += event.stop_duration;
      }
      return {
        id: event.id,
        name: event.name,
        start_date: event.start_date,//formattedDate.toISOString()
        end_date: event.end_date,
        stop_duration: {
          text: convertirTiempo(event.stop_duration),
          value: event.stop_duration
        }
      };
    });
    // Agregar los eventos filtrados y formateados al resultado final
    acc.push(...formattedEvents);
    return acc;
  }, []);
  let events = {
    stop_duration_total: {
      text: convertirTiempo(totalTiempoInactividad),
      value: totalTiempoInactividad
    },
    events: filteredEvents
  }
  return events; //filteredEvents;// uniqueFilteredEvents; //filteredPoints;  //uniqueFilteredEvents;// 
  //console.log(instancePointsEvents);
}

const ObtenerRegistroEventosPoints = async (POSITRACE_CONFIG, id_placa, cuenta, start_date, end_date) => {
  const axios = require('axios');
  //console.log(POSITRACE_CONFIG)
  const tokensExistentes = POSITRACE_CONFIG.tokensExistentes;
  // console.log(tokensExistentes);
  var tokenValid = tokensExistentes.find(function (elemento) {
    return (elemento.name).trim() === (cuenta).trim();
  });
  var instancePointsEvents = axios.create({
    baseURL: POSITRACE_CONFIG.api_url_root + `/points`,
    headers: {
      "Accept": "application/json",
      "X-Auth-Token": tokenValid.token,
      "Content-Type": "application/json"
    },
    params: {
      ['filters[entity_type]']: "equipment",
      ['filters[entity_id]']: id_placa,// placaEncontrada.id,
      ['filters[start_date]']: start_date,
      ['filters[end_date]']: end_date
    }
  })
  var instancePointsEvents = await instancePointsEvents.get();
  instancePointsEvents = instancePointsEvents.data;
  let instanceEvents = axios.create({
    baseURL: POSITRACE_CONFIG.api_url_root + `/event_types`,
    headers: {
      "Accept": "application/json",
      "X-Auth-Token": tokenValid.token,
      "Content-Type": "application/json",
      "Locate-Accept-Language": "es"
    },
    params: {
      ['page']: 1,
      ['per_page']: 200,
      ['sort_by']: 'id',
      ['sort']: 'DESC'
    }
  })
  let instanceEventsGet = await instanceEvents.get();
  instanceEventsGet = instanceEventsGet.data;
  //console.log(instanceEventsGet);
  // Filtrar los registros donde "events" no sea una lista vacía
  var filteredPoints = instancePointsEvents.points.filter(function (point) {
    return point.events.length > 0;
  });
  // Crear una nueva lista con los atributos necesarios de "points"
  var resultfilterPoints = filteredPoints.map(function (point) {
    return {
      id: point.id,
      time: restarHorasAFecha(point.time, parseInt(process.env.ADD_TIME)),
      gps: point.gps,
      events: point.events.map(function (event) {
        return {
          id: event.type.id,
          name: instanceEventsGet.event_types.find(evento => evento.id === event.type.id).name,
          start_date: restarHorasAFecha(event.event.start_date, parseInt(process.env.ADD_TIME)),
        };
      })
    };
  });
  const validIds = [1, 2, 8, 9, 10, 12, 21, 22, 30, 33, 39, 77, 107, 108];
  // Filtrar events con id existente en validIds
  const filteredEvents = resultfilterPoints.reduce((acc, obj) => {
    const filteredEvents = obj.events.filter(event => validIds.includes(event.id));
    // Formatear la fecha y quitar milisegundos y segundos
    const formattedEvents = filteredEvents.map(event => {
      const formattedDate = new Date(event.start_date);
      formattedDate.setSeconds(0);
      formattedDate.setMilliseconds(0);
      return {
        id: event.id,
        name: event.name,
        start_date: formattedDate.toISOString()
      };
    });
    // Agregar los eventos filtrados y formateados al resultado final
    acc.push(...formattedEvents);
    return acc;
  }, []);
  // Eliminar elementos duplicados basados en id, name y start_date
  const uniqueFilteredEvents = filteredEvents.filter((event, index, self) =>
    index === self.findIndex(e =>
      e.id === event.id &&
      e.name === event.name &&
      e.start_date === event.start_date
    )
  );
  return uniqueFilteredEvents;//resultfilterPoints;
  //console.log(instancePointsEvents);
}

const ObtenerRegistroEventos = async (POSITRACE_CONFIG, id_placa, cuenta, start_date, end_date) => {
  const axios = require('axios');
  //console.log(POSITRACE_CONFIG)
  const tokensExistentes = POSITRACE_CONFIG.tokensExistentes;
  // console.log(tokensExistentes);
  var tokenValid = tokensExistentes.find(function (elemento) {
    return (elemento.name).trim() === (cuenta).trim();
  });
  var instanceEvents = axios.create({
    baseURL: POSITRACE_CONFIG.api_url_root + `/event_types`,
    headers: {
      "Accept": "application/json",
      "X-Auth-Token": tokenValid.token,
      "Content-Type": "application/json"
    },
    params: {
      ['page']: 1,
      ['per_page']: 200,
      ['sort_by']: 'id',
      ['sort']: 'DESC'
    }
  })
  var instanceEventsGet = await instanceEvents.get();
  eventos_existentes = instanceEventsGet.data;
  instanceEventsGet = instanceEventsGet.data.event_types.map(item => item.id);
  //console.log(instanceEventsGet);
  const dataTask = {
    report_type: 'events',
    measurement_type: 'metric',
    filters: {
      event_type_ids: instanceEventsGet,
      is_all_equipment: true,
      start_date: start_date,//'2023-12-12T00:00:00.000Z',
      end_date: end_date,//'2023-12-12T23:59:59.000Z',
      load_all_indices_of_states: true,
      equipment_ids: [id_placa]
    },
    groups: {
      order: ['manual_group', 'equipment', 'state_type_and_input_index', 'bunch', 'state'],
      time_zone: 'America/Mexico_City',
      bunch: {
        type: 'day',
        perforation: null
      }
    },
    format_ids: [1],
    only_totals: false
  };
  let urltaskEvents = POSITRACE_CONFIG.api_url_root + `/sensors_report/tasks`;
  var instanceurltaskEvents = await axios.post(urltaskEvents, dataTask, {
    headers: {
      'Accept': 'application/json',
      'X-Auth-Token': tokenValid.token,
      'Content-Type': 'application/json'
    }
  })
  let state = instanceurltaskEvents.data.sensors_report_task.state;
  let idTaskGenerado = instanceurltaskEvents.data.sensors_report_task.id;
  let registroEncontradoTask;
  while (state == "pending") {
    var instanceTaksCreate = axios.create({
      baseURL: POSITRACE_CONFIG.api_url_root + `/sensors_report/tasks`,
      headers: {
        "Accept": "application/json",
        "X-Auth-Token": tokenValid.token,
        "Content-Type": "application/json"
      },
      params: {
        ['page']: 1,
        ['per_page']: 200,
        ['sort_by']: 'id',
        ['sort']: 'DESC',
        ['report_type']: 'events',
        ['visible']: 'true',
      }
    })
    instanceTaksCreate = await instanceTaksCreate.get();
    instanceTaksCreate = instanceTaksCreate.data;
    registroEncontradoTask = instanceTaksCreate.tasks.find(task => task.id === idTaskGenerado);
    if (registroEncontradoTask.state == "ready") {
      break;
    }
  }
  let idReport = registroEncontradoTask.reports[0].id;
  var instanceReportCreate = axios.create({
    baseURL: POSITRACE_CONFIG.api_url_root + `/sensors_report/reports/` + idReport,
    headers: {
      "Accept": "application/json",
      "X-Auth-Token": tokenValid.token,
      "Content-Type": "application/json"
    }
  })
  instanceReportCreate = await instanceReportCreate.get();
  instanceReportCreate = instanceReportCreate.data;
  var instanceEventstypes = axios.create({
    baseURL: POSITRACE_CONFIG.api_url_root + `/sensors_report/event_types`,
    headers: {
      "Accept": "application/json",
      "X-Auth-Token": tokenValid.token,
      "Content-Type": "application/json",
      "Locate-Accept-Language": "es"
    },
    params: {
      ['page']: 1,
      ['per_page']: 200,
      ['sort_by']: 'id',
      ['sort']: 'DESC'
    }
  })
  var instanceEventstypes = await instanceEventstypes.get();
  let dataReporteinfo = instanceReportCreate.sensors_report_report.data[0];
  if (isNullOrUndefinedOrEmpty(dataReporteinfo)) {
    throw new Error("Sin datos que mostrar.");
  }
  //instanceEventstypes = instanceEventstypes.data.event_types.filter(evento => evento.analyzer_state_type === "trip");
  // Agregar el atributo group_value a cada objeto metrics
  const metricsArray = instanceReportCreate.sensors_report_report.data[0].items[0].items.map(item => ({
    ...item.metrics,
    group_value: item.group_value,
    info_events_type: obtenerIdoEventsType(instanceEventstypes.data.event_types.filter(evento => evento.analyzer_state_type === item.group_value)),
    detail_items: item.items.map(({ items }) => ({ items }))
  }));
  //instanceReportCreate.sensors_report_report.data[0].items[0]
  let ReporteEventos = {
    event_data: instanceReportCreate.sensors_report_report.data[0].items[0].metrics,
    event_data: metricsArray
    // EventosExistentes: eventos_existentes
  }
  return ReporteEventos;//instanceReportCreate.sensors_report_report.data[0].items[0].items;
  //return instanceReportCreate.sensors_report_report.data[0].items[0].items;
}

const ObtenerUltimaUbicacion = async (POSITRACE_CONFIG, id_placa, cuenta) => {
  const axios = require('axios');
  console.log(POSITRACE_CONFIG)
  const tokensExistentes = POSITRACE_CONFIG.tokensExistentes;
  // console.log(tokensExistentes);
  var tokenValid = tokensExistentes.find(function (elemento) {
    return (elemento.name).trim() === (cuenta).trim();
  });
  var instanceUnidad = axios.create({
    baseURL: POSITRACE_CONFIG.api_url_root + `/equipment/` + id_placa,
    headers: {
      "Accept": "application/json",
      "X-Auth-Token": tokenValid.token,
      "Content-Type": "application/json"
    }
  })
  var equipment = await instanceUnidad.get();
  ///console.log(equipment.data)
  // Crear un nuevo objeto JSON con "timestamp" y "position"
  let add_time = process.env.ADD_TIME
  const DatosGPS = {
    timestamp_update: restarHorasAFecha(equipment.data.equipment.equipment_state_cache.gps.timestamp, add_time),
    timestamp_origin: equipment.data.equipment.equipment_state_cache.gps.timestamp,
    position: equipment.data.equipment.equipment_state_cache.gps.position
  };
  return DatosGPS;
}

const obtenerPlacasCuenta = async (POSITRACE_CONFIG) => {
  const axios = require('axios');
  const tokensExistentes = POSITRACE_CONFIG.tokensExistentes;
  var placasCuenta = [];
  for (const item of tokensExistentes) {
    var instanceUnidad = axios.create({
      baseURL: POSITRACE_CONFIG.api_url_root + `/equipment/base_list`,
      headers: {
        "Accept": "application/json",
        "X-Auth-Token": item.token,
        "Content-Type": "application/json"
      }
    })
    var respUnidades = await instanceUnidad.get();
    var unidades = respUnidades.data.equipment;
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
  return placasCuenta;
}

const Equipment = async (req = request, res = response) => {
  try {
    let token = req.query.token;
    let opc = req.query.opcion;
    let cuenta = req.query.cuenta;
    let id_placa = req.query.id_placa;
    let fecha_inicio = req.query.fecha_inicio;
    let fecha_fin = req.query.fecha_fin;
    var POSITRACE_CONFIG = await DatosConexion(token, cuenta);
    if (!POSITRACE_CONFIG.valid) {
      throw new Error(POSITRACE_CONFIG.message);
    }
    if (!opc) {
      throw new Error("Ingrese tipo de opción válida.");
    }
    if (opc == 1 || opc == 3) {
      if (!cuenta) {
        throw new Error("Ingrese una cuenta para esta placa.");
      }
      if (!id_placa) {
        throw new Error("Ingrese una id de placa para consultar.");
      }
      if (opc == 3) {
        if (!validarFormatoFechaPositracer(fecha_inicio)) {
          throw new Error("Ingrese una fecha inicio valida.");
        }
        if (!validarFormatoFechaPositracer(fecha_fin)) {
          throw new Error("Ingrese una fecha final valida.");
        }
      }
    }
    let datosReturn;
    if (opc == 1) {
      datosReturn = await ObtenerUltimaUbicacion(POSITRACE_CONFIG, id_placa, cuenta);
      res.json(datosReturn);
    }
    else if (opc == 2) {
      datosReturn = await obtenerPlacasCuenta(POSITRACE_CONFIG);
      res.json(datosReturn);
    }
    else if (opc == 3) {
      //console.log(fecha_inicio);
      //console.log(fecha_fin);
      fecha_inicio = sumarHorasAFecha(fecha_inicio, parseInt(process.env.ADD_TIME));
      fecha_fin = sumarHorasAFecha(fecha_fin, parseInt(process.env.ADD_TIME));
      //console.log(fecha_inicio);
      //console.log(fecha_fin);
      datosReturn = await ObtenerRegistroEventos(POSITRACE_CONFIG, id_placa, cuenta, fecha_inicio, fecha_fin);
      res.json(datosReturn);
    }
    else if (opc == 4) {
      fecha_inicio = sumarHorasAFecha(fecha_inicio, parseInt(process.env.ADD_TIME));
      fecha_fin = sumarHorasAFecha(fecha_fin, parseInt(process.env.ADD_TIME));
      datosReturn = await ObtenerRegistroEventosPoints(POSITRACE_CONFIG, id_placa, cuenta, fecha_inicio, fecha_fin);
      res.json(datosReturn);
    }
    else if (opc == 5) {
      fecha_inicio = sumarHorasAFecha(fecha_inicio, parseInt(process.env.ADD_TIME));
      fecha_fin = sumarHorasAFecha(fecha_fin, parseInt(process.env.ADD_TIME));
      datosReturn = await ObtenerRegistroEventosPointsV2(POSITRACE_CONFIG, id_placa, cuenta, fecha_inicio, fecha_fin);
      res.json(datosReturn);
    }
    else {
      res.json({ "message": "Sin datos para mostrar" });
    }
  } catch (e) {
    res.json({ "error": e.message });
  }
}

obtenerIdoEventsType = (eventTypes) => {
  const eventsInfo = eventTypes.map(({ sensors_report_types, analyzer_state_type, analyzer_state_name }) => ({
    sensors_report_types,
    analyzer_state_type,
    analyzer_state_name,
  }));
  return eventsInfo;
}

module.exports = { Equipment }
