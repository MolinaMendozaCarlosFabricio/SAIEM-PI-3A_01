const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const usersJWTRoutes = require('./routes/users_jwt');
const alumnosRoutes = require('./routes/alumnos');
const empleadosRoutes = require('./routes/empleados');
const tramitesRoutes = require('./routes/pagoDeTramites');
const pagoERoutes = require('./routes/pagoEmpleados');
require('dotenv').config();
const app = express();
const port = process.env.DB_PORT || 3000;
app.use(cors());

//En esta variable se agregan las direcciones a las que se les permite el acceso a la API
const permitirAcceso = ['https://saiem.integrador.xyz'];
// Middleware para analizar los cuerpos de las solicitudes
//app.use(cors({ origin: permitirAcceso }));
app.use(cors());
app.use(bodyParser.json());

// Usar las rutas de los items
app.use('/usersJWT', usersJWTRoutes);
app.use('/alumnos', alumnosRoutes);
app.use('/empleados', empleadosRoutes);
app.use('/tramites',tramitesRoutes);
app.use('/PagoEmp',pagoERoutes);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor Express en ejecución en http://localhost:${port}`);
});
