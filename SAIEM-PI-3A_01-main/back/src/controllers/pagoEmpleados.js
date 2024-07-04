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
    console.log('Pago de empleados-Conexión a la BD establecida');
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
  
  exports.addPagoProfesor = [authenticateJWT,(req, res) => {
    const {horasTrabajadas, totalPago, fechaPago, idProfesor} = req.body;
  
    // Insertar el nuevo profesor en la base de datos 
    db.query(`INSERT INTO PagoEmpleados (horasTrabajadas, totalPago, fechaPago, estado, idProfesor) VALUES (?,?,?,'Sin pagar',?);`,
      [horasTrabajadas, totalPago, fechaPago, idProfesor], (err, result) => {
      if (err) {
        res.status(500).send('Error al agregar el Pago del profesor');
        return; // Stop execution if there's an error inserting
      }
      res.status(201).send('Pago del profesor agregado correctamente');
    });
  }];

  exports.addPagoPersonal = [authenticateJWT,(req, res) => {
    const {horasTrabajadas, totalPago,fechaPago,idPersonal} = req.body;
  
    // Insertar el nuevo profesor en la base de datos 
    db.query(`INSERT INTO PagoEmpleados (horasTrabajadas, totalPago,fechaPago, estado, idPersonal) VALUES (?,?,?,'Sin pagar',?)`,
      [horasTrabajadas,totalPago,fechaPago,idPersonal], (err, result) => {
      if (err) {
        res.status(500).send('Error al agregar el Pago del profesor');
        return; // Stop execution if there's an error inserting
      }
      res.status(201).send('Pago del profesor agregado correctamente');
    });
  }];

  exports.getAllPagoE = [authenticateJWT, (req,res) => {
    db.query('SELECT * FROM PagoEmpleados', (err, result) => {
      if (err) {
        res.status(500).send('Error al mostrar todos los pagos de los empleados realizados');
        throw err;
      }
      res.json(result);
    });
  }];