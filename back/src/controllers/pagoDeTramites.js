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
  exports.addTramites = [/*authenticateJWT,*/ (req, res) => {
    const {folio, concepto, monto, fechaDeCorte, id_alumno} = req.body;
  
    db.query(`INSERT INTO PagoTramites (folio, concepto, monto, fechaDeCorte, id_estatus, id_alumno) VALUES (?,?,?,?,'1',?)`,
      [folio, concepto, monto, fechaDeCorte, id_alumno], (err, result) => {
      if (err) {
        res.status(500).send('Error al agregar el Pago de trámite');
        return; // Stop execution if there's an error inserting
      }
      res.status(201).send('Pago de trámite agregado correctamente');
    });
  }];
  
  exports.getAllTramites = [/*authenticateJWT,*/ (req,res) => {
    db.query('SELECT * FROM PagoTramites', (err, result) => {
      if (err) {
        res.status(500).send('Error al mostrar todos los trámites realizados');
        throw err;
      }
      res.json(result);
    });
  }];

  exports.changeTramites = [/*authenticateJWT,*/ (req,res) => {
    const tramiteId = req.params.id;

    db.query('UPDATE PagoTramites SET id_estatus = 3 WHERE id = ?',[tramiteId], (err,result) => {
      if (err) {
        console.error('ERROR en cambiar a pagado');
        return;
      }
      res.send('Actualizado a "pagado" correctamente');
    })
  }];

  exports.change2Tramites = [/*authenticateJWT,*/ (req,res) => {
    const tramiteIdN = req.params.id;

    db.query('UPDATE PagoTramites SET id_estatus = 2 WHERE id = ?',[tramiteIdN], (err,result) => {
      if (err) {
        console.error('ERROR en cambiar a Próximo a pagar');
        return;
      }
      res.send('Actualizado a "proximo" correctamente');
    })
  }];

  exports.change4Tramites = [/*authenticateJWT,*/ (req,res) => {
    const tramiteIdA = req.params.id;

    db.query('UPDATE PagoTramites SET id_estatus = 4 WHERE id = ?',[tramiteIdA], (err,result) => {
      if (err) {
        console.error('ERROR en cambiar a atrasado');
        return;
      }
      res.send('Actualizado a "atrasado" correctamente');
    })
  }];

  exports.buscarORfiltrarTramites = [/*authenticateJWT,*/ (req, res) => {
    const {folio_busqueda, concepto_busqueda,  fechaDeCorteFiltro, estatusFiltro} = req.body;
    let consulta = `SELECT PagoTramites.id, PagoTramites.folio, PagoTramites.concepto, PagoTramites.monto, PagoTramites.fechaDeCorte, EstatusPago.tipo_estatus, Alumnos.nombre, Alumnos.apellido_p, Alumnos.apellido_m, Alumnos.grado, Alumnos.grupo
      FROM PagoTramites
      JOIN EstatusPago ON PagoTramites.id_estatus = EstatusPago.id
      JOIN Alumnos ON PagoTramites.id_alumno = Alumnos.id
      WHERE 1 = 1`;
    let parametros = [];
  
    if(folio_busqueda){
      consulta += ` AND PagoTramites.folio LIKE ?`;
      parametros.push(folio_busqueda+'%');
    }
    if (concepto_busqueda){
      consulta += ` AND PagoTramites.concepto LIKE ?`;
      parametros.push(concepto_busqueda+'%');
    }
    if(fechaDeCorteFiltro){
      consulta += ` AND PagoTramites.fechaDeCorte = ?`;
      parametros.push(fechaDeCorteFiltro);
    }
    if(estatusFiltro){
      consulta += ` AND PagoTramites.id_estatus = ?`;
      parametros.push(estatusFiltro);
  
    }
    
    db.query(consulta, parametros, (err, result) => {
        if (err){
          res.status(500).send(`Error al buscar informacion de los Tramites de los alumnos`);
          throw err;
        }
        res.json(result);
      }
    )
    
  }];

