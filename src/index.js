const express = require('express');
const app = express();
const morgan = require('morgan');
require('dotenv').config();
let cors = require('cors')
app.use(cors())
const http = require('http');  // Importar el módulo HTTP

// // settings
app.set("port", process.env.PORT || 2500);
//app.use('/Config', express.static('Config'));

 // middlewares

app.use(morgan("common"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// routes
app.use(require('./routes/equipment'));
app.use(require('./routes/state_trips'));
app.use(require('./routes/casetas_rutas'));
app.use(require('./routes/configuracion_rutas'));
// starting the server
// Create the HTTP server
const server = http.createServer(app);
server.setTimeout(1800000);

app.listen(app.get("port"), () => {
  
  console.log(`Server on port ${app.get("port")}`);
});