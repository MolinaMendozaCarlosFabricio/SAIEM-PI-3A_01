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
  
  exports.addProfesor = [/*authenticateJWT ,*/ (req, res) => {
    const {nombre, apellido_p, apellido_m, telefono, correo, curp, sueldoPorHora, id_especialidad} = req.body;
  
    // Insertar el nuevo profesor en la base de datos 
    db.query('INSERT INTO Profesor (nombre, apellido_p, apellido_m, telefono, correo, curp, sueldoPorHora, id_estatus, id_especialidad) VALUES (?,?,?,?,?,?,?,"1",?)',
      [nombre, apellido_p, apellido_m, telefono, correo, curp, sueldoPorHora, id_especialidad], (err, result) => {
      if (err) {
        res.status(500).send('Error al agregar el Profesor');
        return; // Stop execution if there's an error inserting
      }
      res.status(201).send('Profesor agregado correctamente');
    });
  }];
  
  exports.updateProfesor = [/*authenticateJWT,*/(req, res) => {
    const profesorId = req.params.id;
    const {nombre, apellido_p, apellido_m, telefono, correo, curp, sueldoPorHora, id_estatus, id_especialidad} = req.body;
  
    db.query(
      `UPDATE Profesor SET nombre = ?, apellido_p = ?, apellido_m = ?, telefono = ?, correo = ?, curp = ?, sueldoPorHora = ?, id_estatus = ?, id_especialidad = ? WHERE id = ?`,
      [nombre, apellido_p, apellido_m, telefono, correo, curp, sueldoPorHora, id_estatus, id_especialidad],
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

  exports.addMaterias = [/*authenticateJWT, */(req,res) => {
    
    const {idMateria, idMaestro} = req.body;

    db.query('INSERT INTO Teach (idMateria, idMaestro) VALUES (?,?)', 
      [idMateria, idMaestro], (err,result) => {
        if (err) {
          res.status(500).send('ERROR: error al "enseñar".');
          return;
        }
        res.status(201).send('Valores agregados correctamente');
      }
    );
  }];

  exports.showMaterias = [/*authenticateJWT,*/ (req, res) => {
    const { Profesor } = req.body; 
    
    const query = `
      SELECT Materias.nombre, Teach.idMaestro 
      FROM Teach 
      JOIN Materias ON Teach.idMateria = Materias.id 
      WHERE Teach.idMaestro = ?
    `;
  
    db.query(query, [Profesor], (err, result) => {
      if (err) {
        res.status(500).send('Error al mostrar las materias');
        throw err;
      }
      res.json(result);
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

  exports.mostrarProfesores = [/*authenticateJWT,*/ (req, res) => {
    const {nombre_busqueda, apellido_p_busqueda, apellido_m_busqueda, estatusFiltro, especialidadFiltro} = req.body;
    let consulta = `SELECT Profesor.id, Profesor.nombre, Profesor.apellido_p, Profesor.apellido_m, EstatusPersona.tipo_estatus, Especialidades.nombre
      FROM Profesor
      JOIN Turno ON Profesor.id_turno = Especialidades.id
      JOIN EstatusPersona ON Profesor.id_estatus = EstatusPersona.id
      WHERE 1 = 1`;
    let parametros = [];
  
    if(nombre_busqueda){
      consulta += ` AND Profesor.nombre LIKE ?`;
      parametros.push(nombre_busqueda + '%');
    }
    if (apellido_p_busqueda){
      consulta += ` AND Profesor.apellido_p LIKE ?`;
      parametros.push(apellido_p_busqueda + '%');
    }
    if(apellido_m_busqueda){
      consulta += ` AND Profesor.apellido_m LIKE ?`;
      parametros.push(apellido_m_busqueda + '%');
    }
    if(especialidadFiltro){
      consulta += ` AND Profesor.id_especialidad = ?`;
      parametros.push(especialidadFiltro);
    }
    if(estatusFiltro){
      consulta += ` AND Profesor.id_estatus = ?`;
      parametros.push(estatusFiltro);
  
    }
    
    db.query(consulta, parametros, (err, result) => {
        if (err){
          res.status(500).send(`Error al buscar informacion de los Alumnos`);
          throw err;
        }
        res.json(result);
      }
    )
    
  }];

  exports.addPersonal = [/*authenticateJWT,*/(req, res) => {
    const {nombre, apellido_p, apellido_m, telefono, correo, curp, sueldoHora, id_cargo, id_area} = req.body;
  
    // Insertar el nuevo profesor en la base de datos 
    db.query('INSERT INTO Personal (nombre, apellido_p, apellido_m, telefono, correo, curp, sueldoHora, id_estatus, id_cargo, id_area) VALUES (?,?,?,?,?,?,?,"1",?,?)',
      [nombre, apellido_p, apellido_m, telefono, correo, curp, sueldoHora, id_cargo, id_area], (err, result) => {
      if (err) {
        res.status(500).send('Error al agregar el Personal');
        return; // Stop execution if there's an error inserting
      }
      res.status(201).send('Personal agregado correctamente');
    });
  }];
  
  exports.updatePersonal = [/*authenticateJWT,*/(req, res) => {
    const personalId = req.params.id;
    const {nombre, apellido_p, apellido_m, telefono, correo, curp, sueldoHora, id_estatus, id_cargo, id_area} = req.body;
  
    db.query(
      `UPDATE Personal SET nombre = ?, apellido_p = ?, apellido_m = ?, telefono = ?, correo = ?, curp = ?, sueldoHora = ?, id_estatus = ?, id_cargo = ?, id_area = ? WHERE id = ?`,
      [nombre, apellido_p, apellido_m, telefono, correo, curp, sueldoHora,id_estatus,id_cargo,id_area,personalId],
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
  
  exports.cancelPersonal = [/*authenticateJWT,*/ (req, res) => {
    const personalId = req.params.id;
    db.query(`UPDATE Personal SET id_estatus = '3' WHERE id = ?`, [personalId], (err, result) => {
      if (err) {
        res.status(500).send('Error al dar de baja al personal');
        throw err;
      }
      res.send('Personal dado de baja');
    });
  }];

  exports.getAllPersonal = [/*authenticateJWT,*/ (req,res) => {
    db.query('SELECT * FROM Personal', (err, result) => {
      if (err) {
        res.status(500).send('Error al obtener mostrar todos el personal');
        throw err;
      }
      res.json(result);
    });
  }];