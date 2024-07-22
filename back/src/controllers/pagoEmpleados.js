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
  
  exports.addPagoProfesor = [authenticateJWT, (req, res) => {
    const {horasTrabajadas, totalPago, fechaPago, idProfesor} = req.body;
  
    // Insertar el nuevo profesor en la base de datos 
    db.query(`INSERT INTO PagoEmpleados (horasTrabajadas, totalPago, fechaPago, id_estatus, idProfesor) VALUES (?,?,?,'1',?);`,
      [horasTrabajadas, totalPago, fechaPago, idProfesor], (err, result) => {
      if (err) {
        res.status(500).json({ error : 'Error al agregar el Pago del profesor'});
        return; // Stop execution if there's an error inserting
      }
      res.status(201).json({ message : 'Pago del profesor agregado correctamente'});
    });
  }];

  exports.addPagoPersonal = [authenticateJWT, (req, res) => {
    const {horasTrabajadas, totalPago,fechaPago,idPersonal} = req.body;
  
    // Insertar el nuevo profesor en la base de datos 
    db.query(`INSERT INTO PagoEmpleados (horasTrabajadas, totalPago,fechaPago, id_estatus, idPersonal) VALUES (?,?,?,'1',?)`,
      [horasTrabajadas,totalPago,fechaPago,idPersonal], (err, result) => {
      if (err) {
        res.status(500).json({ error : "Error al agregar el Pago del personal"})
        return ; // Stop execution if there's an error inserting
      }
      res.status(201).json({ message : 'Pago del personal agregado correctamente'});
    });
  }];

  exports.buscarPersonalAPagar = [authenticateJWT, (req, res) => {
    const {nombre_busqueda, apellido_p_busqueda, apellido_m_busqueda} = req.body;
    let consulta = `SELECT Personal.nombre, Personal.apellido_p, Personal.apellido_m, Personal.id FROM Personal WHERE 1 = 1`;
    let parametros = []

    if(nombre_busqueda){
      consulta+=` AND Personal.nombre LIKE ?`;
      parametros.push(nombre_busqueda+'%')
    }
    if(apellido_p_busqueda){
      consulta+=` AND Personal.apellido_p LIKE ?`;
      parametros.push(apellido_p_busqueda+'%')
    }
    if(apellido_m_busqueda){
      consulta+=` AND Personal.apellido_m LIKE ?`;
      parametros.push(apellido_m_busqueda+'%')
    }
    db.query(consulta, parametros, (err, result) => {
      if (err){
        res.status(500).json({ error : `Error al buscar personal`});
        throw err;
      }
      res.json(result);
    })
  }];

  exports.mandarSueldoPersonal = [authenticateJWT, (req, res) => {
    const idPersonal = req.params.id;

    db.query(`SELECT Personal.sueldoHora FROM Personal WHERE Personal.id = ?`, [idPersonal],
      (err, result) => {
        if (err){
          res.status(500).json({ error : `Error al buscar el sueldo personal`});
          throw err;
        }
        res.json(result);
      }
    )
  }];

  exports.mandarSueldoProfesor = [authenticateJWT, (req, res) => {
    const idProfesor = req.params.id;
    db.query(`SELECT sueldoPorHora FROM Profesor WHERE id = ?`, [idProfesor], (err, result) => {
      if (err){
        res.status(500).json({ error : `Error al buscar el sueldo del maestro`});
        throw err;
      }
      res.json(result);
    })
  }];

  exports.getAllPagoE = [authenticateJWT, (req,res) => {
    db.query('SELECT * FROM PagoEmpleados', (err, result) => {
      if (err) {
        res.status(500).json({ error : 'Error al mostrar todos los pagos de los empleados realizados'});
        throw err;
      }
      res.json(result);
    });
  }];

  exports.searchPersonal = [authenticateJWT, (req, res) => {
    const {nombreB, apellido_pB,apellido_mB, fechaPagoB, estatusF} = req.body;
    let consulta = `SELECT PagoEmpleados.id, Personal.nombre, Personal.apellido_p, Personal.apellido_m , Cargos.nombre_cargo, PagoEmpleados.horasTrabajadas, PagoEmpleados.totalPago, PagoEmpleados.fechaPago, EstatusPago.tipo_estatus 
      FROM PagoEmpleados
      JOIN EstatusPago ON PagoEmpleados.id_estatus = EstatusPago.id
      JOIN Personal ON PagoEmpleados.idPersonal = Personal.id
      JOIN Cargos ON Personal.id_cargo = Cargos.id
      WHERE 1 = 1`;
    let parametros = [];
  
    if(nombreB){
      consulta += ` AND Personal.nombre LIKE ?`;
      parametros.push(nombreB+'%');
    }
    if(apellido_pB){
      consulta += ` AND Personal.apellido_p LIKE ?`;
      parametros.push(apellido_pB+'%');
    }
    if(apellido_mB){
      consulta += ` AND Personal.apellido_m LIKE ?`;
      parametros.push(apellido_mB+'%');
    }
    if (fechaPagoB){
      consulta += ` AND PagoEmpleados.fechaPago LIKE ?`;
      parametros.push(fechaPagoB+'%');
    }
    if (estatusF) {
      consulta += ' AND PagoEmpleados.id_estatus LIKE ?';
      parametros.push(estatusF+'%');
    }
    
    db.query(consulta, parametros, (err, result) => {
        if (err){
          res.status(500).json({ error : `Error al buscar informacion de los Tramites de los alumnos`});
          throw err;
        }
        res.json(result);
      }
    )
    
  }];

  exports.searchProfesor = [authenticateJWT, (req, res) => {
    const {nombreB, apellido_pB, apellido_mB, fechaPagoB, estatusF} = req.body;
    let consulta = `SELECT PagoEmpleados.id, Profesor.nombre, Profesor.apellido_p, Profesor.apellido_m, PagoEmpleados.horasTrabajadas, PagoEmpleados.totalPago, PagoEmpleados.fechaPago, EstatusPago.tipo_estatus 
      FROM PagoEmpleados
      JOIN EstatusPago ON PagoEmpleados.id_estatus = EstatusPago.id
      JOIN Profesor ON PagoEmpleados.idProfesor = Profesor.id
      WHERE 1 = 1`;
    let parametros = [];
  
    if(nombreB){
      consulta += ` AND Profesor.nombre LIKE ?`;
      parametros.push(nombreB+'%');
    }
    if(apellido_pB){
      consulta += ` AND Profesor.apellido_p LIKE ?`;
      parametros.push(apellido_pB+'%');
    }
    if(apellido_mB){
      consulta += ` AND Profesor.apellido_m LIKE ?`;
      parametros.push(apellido_mB+'%');
    }
    if (fechaPagoB){
      consulta += ` AND PagoEmpleados.fechaPago LIKE ?`;
      parametros.push(fechaPagoB+'%');
    }
    if (estatusF) {
      consulta += ' AND PagoEmpleados.id_estatus LIKE ?';
      parametros.push(estatusF+'%');
    }
    
    db.query(consulta, parametros, (err, result) => {
        if (err){
          res.status(500).json({ error : `Error al buscar informacion de los Tramites de los alumnos`});
          throw err;
        }
        res.json(result);
      }
    )
    
  }];

  exports.pagoPagado = [authenticateJWT, (req,res) => {
    const tramiteId = req.params.id;
    const updateStatus= req.body.id_estatus;

    db.query('UPDATE PagoEmpleados SET id_estatus = 3 WHERE id = ?',[tramiteId,updateStatus], (err,result) => {
      if (err) {
        console.error('ERROR en cambiar a pagado');
        res.status(500).json({ error : 'Error al actualizar estado'});
        return;
      }
      res.status(201).json({ message : 'Actualizado a "pagado" correctamente'});
    })
  }];

  exports.pagoProximo = [authenticateJWT, (req,res) => {
    const tramiteIdN = req.params.id;
    const updateNext = req.body.id_estatus;

    db.query('UPDATE PagoEmpleados SET id_estatus = 2 WHERE id = ?',[tramiteIdN,updateNext], (err,result) => {
      if (err) {
        console.error('ERROR en cambiar a Próximo a pagar');
        res.status(500).json({ error : "Error al actualizar estado"})
        return;
      }
      res.status(201).json({ message : 'Actualizado a "proximo" correctamente'});
    })
  }];

  exports.pagoAtrasado = [authenticateJWT, (req,res) => {
    const tramiteIdA = req.params.id;
    const updateAtras = req.body;

    db.query('UPDATE PagoEmpleados SET id_estatus = 4 WHERE id = ?',[tramiteIdA,updateAtras], (err,result) => {
      if (err) {
        console.error('ERROR en cambiar a atrasado');
        res.status(500).json({ error : "Error al cambiar estado del pago" })
        return;
      }
      res.status(201).json({ message: 'Actualizado a "atrasado" correctamente'});
    })
  }];


  exports.printOptionPersonal = [authenticateJWT, (req, res) => {
    const {nombre_busqueda, apellido_p_busqueda, apellido_m_busqueda} = req.body;
    let consulta = `SELECT Personal.id, Personal.nombre, Personal.apellido_p, Personal.apellido_m
      FROM Personal
      WHERE 1 = 1`;
    let parametros = [];

    if(nombre_busqueda){
      consulta += ` AND Personal.nombre LIKE ?`;
      parametros.push(nombre_busqueda+'%');
    }
    if(apellido_p_busqueda){
      consulta += ` AND Personal.apellido_p LIKE ?`;
      parametros.push(apellido_p_busqueda+'%');
    }
    if(apellido_m_busqueda){
      consulta += ` AND Personal.apellido_m LIKE ?`;
      parametros.push(apellido_m_busqueda+'%');
    }

    db.query(consulta, parametros, (err, result) => {
      if (err){
        res.status(500).json({ error : `Error al imprimir las opciones de alumnos`});
        throw err;
      }
      res.json(result);
    });
  }];


  exports.printOptionProfesor = [authenticateJWT, (req, res) => {
    const {nombre_busqueda, apellido_p_busqueda, apellido_m_busqueda} = req.body;
    let consulta = `SELECT Profesor.id, Profesor.nombre, Profesor.apellido_p, Profesor.apellido_m
      FROM Profesor
      WHERE 1 = 1`;
    let parametros = [];

    if(nombre_busqueda){
      consulta += ` AND Profesor.nombre LIKE ?`;
      parametros.push(nombre_busqueda+'%');
    }
    if(apellido_p_busqueda){
      consulta += ` AND Profesor.apellido_p LIKE ?`;
      parametros.push(apellido_p_busqueda+'%');
    }
    if(apellido_m_busqueda){
      consulta += ` AND Profesor.apellido_m LIKE ?`;
      parametros.push(apellido_m_busqueda+'%');
    }

    db.query(consulta, parametros, (err, result) => {
      if (err){
        res.status(500).json({ error : `Error al imprimir las opciones del profesor`});
        throw err;
      }
      res.json(result);
    });
  }];