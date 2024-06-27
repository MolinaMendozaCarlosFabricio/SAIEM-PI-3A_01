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
    console.log('Empleados-Conexión a la BD establecida');
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

  exports.getAllProfesores = [authenticateJWT, (req,res) => {
    db.query('SELECT * FROM Profesor', (err, result) => {
      if (err) {
        res.status(500).send('Error al obtener mostrar todos los profesores');
        throw err;
      }
      res.json(result);
    });
  }];

  exports.addPersonal = [authenticateJWT,(req, res) => {
    const {nombre, apellidos, telefono, correo, curp, cargo, suedoHora, estado} = req.body;
  
    // Insertar el nuevo profesor en la base de datos 
    db.query('INSERT INTO Personal (nombre, apellidos, telefono, correo, curp, cargo, suedoHora, estado) VALUES (?,?,?,?,?,?,?,?)',
      [nombre, apellidos, telefono, correo, curp, cargo, suedoHora, estado], (err, result) => {
      if (err) {
        res.status(500).send('Error al agregar el Personal');
        return; // Stop execution if there's an error inserting
      }
      res.status(201).send('Personal agregado correctamente');
    });
  }];
  
  exports.updatePersonal = [authenticateJWT,(req, res) => {
    const personalId = req.params.id;
    const {nombre, apellidos, telefono, correo, curp, cargo, suedoHora, estado} = req.body;
  
    db.query(
      `UPDATE Personal SET nombre = ?, apellidos = ?, telefono = ?, correo = ?, curp = ?, cargo = ?, suedoHora = ?, estado = ? WHERE id = ?`,
      [nombre, apellidos, telefono, correo, curp, cargo, suedoHora, estado,personalId],
      (err, result) => {
        if (err) {
          console.error('Error al actualizar los datos del personal:', err);
          res.status(500).send('Error al actualizar los datos del personal');
          return;
        }
  
        console.log('Resultado de la actualización:', result);
        res.send('personal actualizado correctamente');
      }
    );
  }];
  
  exports.cancelPersonal = [authenticateJWT, (req, res) => {
    const personalId = req.params.id;
    db.query(`UPDATE Personal SET estado = 'Dado de baja' WHERE id = ?`, [personalId], (err, result) => {
      if (err) {
        res.status(500).send('Error al dar de baja al personal');
        throw err;
      }
      res.send('Personal dado de baja');
    });
  }];

  exports.getAllPersonal = [authenticateJWT, (req,res) => {
    db.query('SELECT * FROM Personal', (err, result) => {
      if (err) {
        res.status(500).send('Error al obtener mostrar todos el personal');
        throw err;
      }
      res.json(result);
    });
  }];