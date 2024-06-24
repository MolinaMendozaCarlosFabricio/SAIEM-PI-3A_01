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
    console.log('Profesor-Conexión a la BD establecida');
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
  
  exports.addProfesor = [authenticateJWT,(req, res) => {
    const {nombre, apellido, telefono, correo, curp, especialidad, sueldoPorHora, estado} = req.body;
  
    // Insertar el nuevo profesor en la base de datos 
    db.query('INSERT INTO Profesor (nombre, apellido, telefono, correo, curp, especialidad, sueldoPorHora, estado) VALUES (?,?,?,?,?,?,?,?)',
      [nombre, apellido, telefono, correo, curp, especialidad, sueldoPorHora, estado], (err, result) => {
      if (err) {
        res.status(500).send('Error al agregar el Profesor');
        return; // Stop execution if there's an error inserting
      }
      res.status(201).send('Profesor agregado correctamente');
    });
  }];
  
  exports.updateProfesor = [authenticateJWT,(req, res) => {
    const profesorId = req.params.id;
    const {nombre, apellido, telefono, correo, curp, especialidad, sueldoPorHora, estado} = req.body;
  
    db.query(
      `UPDATE Profesor SET nombre = ?, apellido = ?, telefono = ?, correo = ?, curp = ?, especialidad = ?, sueldoPorHora = ?, estado = ? WHERE id = ?`,
      [nombre, apellido, telefono, correo, curp, especialidad, sueldoPorHora, estado, profesorId],
      (err, result) => {
        if (err) {
          console.error('Error al actualizar el profesor:', err);
          res.status(500).send('Error al actualizar el profesor');
          return;
        }
  
        console.log('Resultado de la actualización:', result);
        res.send('Profesor actualizado correctamente');
      }
    );
  }];
  
  exports.deleteProfesor = [authenticateJWT, (req, res) => {
    const ProfesorId = req.params.id;
    db.query('DELETE FROM Profesor WHERE id = ?', [ProfesorId], (err, result) => {
      if (err) {
        res.status(500).send('Error al eliminar el elemento');
        throw err;
      }
      res.send('Profesor eliminado correctamente');
    });
  }];