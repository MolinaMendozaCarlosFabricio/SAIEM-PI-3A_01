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
        return res.status(500).json( { error : "Error al agregar el profesor" } ); // Stop execution if there's an error inserting
      }
      res.status(201).json({ message: 'Profesor agregado correctamente' });
    });
  }];

  exports.comprobarProfesoresExistentes = [(req, res) => {
    const {nombreComp, apellido_pComp, apellido_mComp} = req.body;
    
    db.query(`SELECT id FROM Profesor WHERE Profesor.nombre = ? AND Profesor.apellido_p = ? AND Profesor.apellido_m = ?`,
      [nombreComp, apellido_pComp, apellido_mComp], (err, result) => {
        if (err) {
          res.status(500).send('Error al buscar coincidencias');
          return res.status(500).json({ error : "Error al buscar coincidencias" }); // Stop execution if there's an error inserting
        }
        res.json(result);

      }
    )
  }];
  
  exports.updateProfesor = [/*authenticateJWT,*/(req, res) => {
    const profesorId = req.params.id;
    const {nombre, apellido_p, apellido_m, telefono, correo, curp, sueldoPorHora, id_estatus, id_especialidad} = req.body;
  
    db.query(
      `UPDATE Profesor SET nombre = ?, apellido_p = ?, apellido_m = ?, telefono = ?, correo = ?, curp = ?, sueldoPorHora = ?, id_estatus = ?, id_especialidad = ? WHERE id = ?`,
      [nombre, apellido_p, apellido_m, telefono, correo, curp, sueldoPorHora, id_estatus, id_especialidad, profesorId],
      (err, result) => {
        if (err) {
          console.error('Error al actualizar el profesor:', err);
          res.status(500).send('Error al actualizar el profesor');
          return res.status(500).json({ error : "Error al actualizar el profesor"});
        }
  
        console.log('Resultado de la actualización:', result);
        res.status(201).json({ message: 'Profesor actualizado correctamente'});
      }
    );
  }];

  exports.addMaterias = [/*authenticateJWT, */(req,res) => {
    
    const {idMateria, idMaestro} = req.body;

    db.query('INSERT INTO Teach (idMateria, idMaestro) VALUES (?,?)', 
      [idMateria, idMaestro], (err,result) => {
        if (err) {
          res.status(500).send('Error al enlazar materia con el profesor');
          return res.status(500).json({ error : "Error al enlazar materia con el profesor"});
        }
        res.status(201).json({ message: 'Materia enlazada con el profesor'});
      }
    );
  }];

  exports.showMaterias = [/*authenticateJWT,*/ (req, res) => {
    const idProfesor = req.params.id; 
    
    const query = `
      SELECT Materias.nombre, Materias.id
      FROM Teach 
      JOIN Materias ON Teach.idMateria = Materias.id 
      WHERE Teach.idMaestro = ?`;
  
    db.query(query, [idProfesor], (err, result) => {
      if (err) {
        res.status(500).send('Error al mostrar las materias');
        throw err;
      }
      res.json(result);
    });
  }];

  exports.deleteMaterias = [(req, res) => {
    const {idProfesor, idMateria} = req.body;

    db.query(`DELETE FROM Teach WHERE idMaestro = ? AND idMateria = ?`, [idProfesor, idMateria],
      (err, result) => {
        if (err) {
          res.status(500).send('Error al deslindar la materia del profesor');
          return res.status(500).json({ error : "Error al deslindar la materia del profesor"});
        }
        res.status(201).json({ message: 'Materia deslindada del profesor'});
      }
    )
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
    let consulta = `SELECT Profesor.id, Profesor.nombre, Profesor.apellido_p, Profesor.apellido_m, EstatusPersona.tipo_estatus, Especialidades.nombre_especialidad
      FROM Profesor
      JOIN Especialidades ON Profesor.id_especialidad = Especialidades.id
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

  exports.mostrarDatosEspecificosDelProfesor = [(req, res) => {
    const idProfesor = req.params.id;
    db.query(`SELECT Profesor.id, Profesor.nombre, Profesor.apellido_p, Profesor.apellido_m, Profesor.telefono, Profesor.correo, Profesor.curp, Profesor.sueldoPorHora, EstatusPersona.tipo_estatus, Especialidades.nombre_especialidad
      FROM Profesor
      JOIN EstatusPersona ON EstatusPersona.id = Profesor.id_estatus
      JOIN Especialidades ON Especialidades.id = Profesor.id_especialidad
      WHERE Profesor.id = ?`, [idProfesor], (err, result) => {
        if(err){
          res.status(500).send(`Error al mostrar datos en especifico del maestro`);
          throw res.status(500).json( { error : 'Error al mostrar datos en especifico del maestro' } );
        }
        res.json(result);
      });
  }];

  exports.addPersonal = [/*authenticateJWT,*/(req, res) => {
    const {nombre, apellido_p, apellido_m, telefono, correo, curp, sueldoHora, id_cargo, id_area} = req.body;
  
    // Insertar el nuevo profesor en la base de datos 
    db.query('INSERT INTO Personal (nombre, apellido_p, apellido_m, telefono, correo, curp, sueldoHora, id_estatus, id_cargo, id_area) VALUES (?,?,?,?,?,?,?,"1",?,?)',
      [nombre, apellido_p, apellido_m, telefono, correo, curp, sueldoHora, id_cargo, id_area], (err, result) => {
      if (err) {
        res.status(500).send('Error al agregar el Personal');
        return res.status(500).json({ error : "Error al registrar el personal" }); // Stop execution if there's an error inserting
      }
      res.status(201).json({ message : 'Personal agregado correctamente'});
    });
  }];

  exports.comprobarPersonalExistente = [(req, res) => {
    const {nombreComp, apellido_pComp, apellido_mComp} = req.body;

    db.query(`SELECT Personal.id FROM Personal WHERE Personal.nombre = ? AND Personal.apellido_p = ? AND Personal.apellido_m = ?`,
      [nombreComp, apellido_pComp, apellido_mComp], (err, result) => {
        if (err) {
          res.status(500).send('Error al buscar coincidencias');
          return res.status(500).json({ error : "Error al buscar coincidencias" }); // Stop execution if there's an error inserting
        }
        res.json(result);
      }
    )
  }];
  
  exports.updatePersonal = [/*authenticateJWT,*/(req, res) => {
    const personalId = req.params.id;
    const {nombre, apellido_p, apellido_m, telefono, correo, curp, sueldoHora,id_estatus,id_cargo,id_area} = req.body;
  
    db.query(
      `UPDATE Personal SET nombre = ?, apellido_p = ?, apellido_m = ?, telefono = ?, correo = ?, curp = ?, sueldoHora = ?, id_estatus = ?, id_cargo = ?, id_area = ? WHERE id = ?`,
      [nombre, apellido_p, apellido_m, telefono, correo, curp, sueldoHora,id_estatus,id_cargo,id_area,personalId],
      (err, result) => {
        if (err) {
          console.error('Error al actualizar los datos del personal:', err);
          res.status(500).send('Error al actualizar los datos del personal');
          return res.status(500).json({ error : "Error al actualizar los datos del personal"});
        }
  
        console.log('Resultado de la actualización:', result);
        res.status(201).json({ message : "personal actualizado correctamente"});
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

  exports.mostrarPersonal = [/*authenticateJWT,*/ (req, res) => {
    const {nombre_busqueda, apellido_p_busqueda, apellido_m_busqueda, estatusFiltro, cargoFiltro, areaFiltro} = req.body;
    let consulta = `SELECT Personal.id, Personal.nombre, Personal.apellido_p, Personal.apellido_m, EstatusPersona.tipo_estatus, Areas.nombre_area, Cargos.nombre_cargo
      FROM Personal
      JOIN Areas ON Personal.id_area = Areas.id
      JOIN Cargos ON Personal.id_cargo = Cargos.id
      JOIN EstatusPersona ON Personal.id_estatus = EstatusPersona.id
      WHERE 1 = 1`;
    let parametros = [];
  
    if(nombre_busqueda){
      consulta += ` AND Personal.nombre LIKE ?`;
      parametros.push(nombre_busqueda + '%');
    }
    if (apellido_p_busqueda){
      consulta += ` AND Personal.apellido_p LIKE ?`;
      parametros.push(apellido_p_busqueda + '%');
    }
    if(apellido_m_busqueda){
      consulta += ` AND Personal.apellido_m LIKE ?`;
      parametros.push(apellido_m_busqueda + '%');
    }
    if(cargoFiltro){
      consulta += ` AND Personal.id_cargo = ?`;
      parametros.push(cargoFiltro);
    }
    if(areaFiltro){
      consulta += ` AND Personal.id_area = ?`
      parametros.push(areaFiltro);
    }
    if(estatusFiltro){
      consulta += ` AND Personal.id_estatus = ?`;
      parametros.push(estatusFiltro);
  
    }
    
    db.query(consulta, parametros, (err, result) => {
        if (err){
          res.status(500).send(`Error al buscar informacion del personal`);
          throw err;
        }
        res.json(result);
      }
    )
    
  }];

  exports.mostrarDatosEspecificosDelPersonal = [(req, res) => {
    const personalId = req.params.id;
    db.query(`SELECT Personal.id, Personal.nombre, Personal.apellido_p, Personal.apellido_m, Personal.telefono, Personal.correo, Personal.curp, Personal.sueldoHora, EstatusPersona.tipo_estatus, Cargos.nombre_cargo, Areas.nombre_area
      FROM Personal 
      JOIN EstatusPersona ON Personal.id_estatus = EstatusPersona.id
      JOIN Cargos ON Personal.id_cargo = Cargos.id
      JOIN Areas ON Personal.id_area = Areas.id
      WHERE Personal.id = ?`,[personalId], (err, result) => {
        if(err){
          res.status(500).send(`Error al mostrar datos en especifico del empleado`);
          throw res.status(500).json( { error : 'Error al mostrar datos en especifico del empleado'} );
        }
        res.json(result);
      });
  }];