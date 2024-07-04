const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

//Configuración de la base de datos
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  });
  db.connect((err) => {
    if (err) throw err;
    console.log('Tramites-Conexión a la BD establecida');
  });

  const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
          return res.sendStatus(403); // Prohibido (token inválido)
        }
        req.user = user;
        next();
      });
    } else {
      res.sendStatus(401); // No autorizado (sin token)
    }
  };
  
  //http://localhost:3000/tramites/add
  exports.addTramites = [authenticateJWT,(req, res) => {
    const {folio, concepto, monto, fechaDeCorte, id_alumno} = req.body;
  
    // Insertar el nuevo profesor en la base de datos 
    db.query(`INSERT INTO PagoTramites (folio, concepto, monto, fechaDeCorte, estado, id_alumno) VALUES (?,?,?,?,'Sin pagar',?)`,
      [folio, concepto, monto, fechaDeCorte, id_alumno], (err, result) => {
      if (err) {
        res.status(500).send('Error al agregar el Pago de trámite');
        return; // Stop execution if there's an error inserting
      }
      res.status(201).send('Pago de trámite agregado correctamente');
    });
  }];
  
  exports.getAllTramites = [authenticateJWT, (req,res) => {
    db.query('SELECT * FROM PagoTramites', (err, result) => {
      if (err) {
        res.status(500).send('Error al mostrar todos los trámites realizados');
        throw err;
      }
      res.json(result);
    });
  }];