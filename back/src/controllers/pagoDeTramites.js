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
  
    db.query(`INSERT INTO PagoTramites (folio, concepto, monto, fechaDeCorte, id_estatus, id_alumno) VALUES (?,?,?,?,1,?)`,
      [folio, concepto, monto, fechaDeCorte, id_alumno], (err, result) => {
      if (err) {
        res.status(500).json({ error : "Error al agregar el Pago de trámite" });
        return; // Stop execution if there's an error inserting
      }
      res.status(201).json({ message : "Pago de trámite agregado correctamente" });
    });
  }];

  exports.buscarCoincidenciasDeFolios = [(req, res) => {
    const folioTramite = req.params.folio;

    db.query(`SELECT id FROM Pagotramites WHERE folio = ?`, [folioTramite], (err, result) => {
      if (err) {
        res.status(500).json({ error : "Error al buscar coincidencias en trámites" });
        return; // Stop execution if there's an error inserting
      }
      res.json(result);
    });
  }];
  
  exports.getAllTramites = [/*authenticateJWT,*/ (req,res) => {
    db.query('SELECT * FROM PagoTramites', (err, result) => {
      if (err) {
        res.status(500).json({ error : 'Error al mostrar todos los trámites realizados'});
        throw err;
      }
      res.json(result);
    });
  }];

  exports.changeTramites = [/*authenticateJWT,*/ (req, res) => {
    const tramiteId = req.params.id;
  
    db.query('UPDATE PagoTramites SET id_estatus = 3 WHERE id = ?', [tramiteId], (err, result) => {
      if (err) {
        console.error('ERROR en cambiar a pagado:', err);
        return res.status(500).json({ error: 'Error al cambiar a pagado' });
      }
      res.json({ message: 'Actualizado a "pagado" correctamente' });
    });
  }];
  
  exports.change2Tramites = [/*authenticateJWT,*/ (req,res) => {
    const tramiteIdN = req.params.id;

    db.query('UPDATE PagoTramites SET id_estatus = 2 WHERE id = ?',[tramiteIdN], (err,result) => {
      if (err) {
        console.error('ERROR en cambiar a Próximo a pagar');
        return res.status(500).json({ error: "Error al cambiar a proximo a pagar"});
      }
      res.json({ message: 'Actualizado a "proximo" correctamente'});
    })
  }];

  exports.change4Tramites = [/*authenticateJWT,*/ (req,res) => {
    const tramiteIdA = req.params.id;

    db.query('UPDATE PagoTramites SET id_estatus = 4 WHERE id = ?',[tramiteIdA], (err,result) => {
      if (err) {
        console.error('ERROR en cambiar a atrasado');
        return res.status(500).json({ error: "Error al cambiar a atrasado"});
      }
      res.json({ message: 'Actualizado a "atrasado" correctamente'});
    })
  }];

  //probar los demás parametros para busqueda
  exports.buscarORfiltrarTramites = [/*authenticateJWT,*/ (req, res) => {
    const {folio_busqueda, concepto_busqueda,nombreBusqueda, apellido_p_busqueda, apellido_m_busqueda, fechaDeCorteFiltro, estatusFiltro, gradoFiltro, grupoFiltro} = req.body;
    let consulta = `SELECT PagoTramites.id, PagoTramites.folio, Alumnos.nombre, Alumnos.apellido_p, Alumnos.apellido_m, Alumnos.grado, Alumnos.grupo, PagoTramites.concepto, PagoTramites.monto, PagoTramites.fechaDeCorte, EstatusPago.tipo_estatus 
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
    if (nombreBusqueda) {
      consulta += ' AND Alumnos.nombre LIKE ?';
      parametros.push(nombreBusqueda+'%');
    }
    if(apellido_p_busqueda) {
      consulta += ' AND Alumnos.apellido_p LIKE ?';
      parametros.push(apellido_p_busqueda+'%');
    }
    if(apellido_m_busqueda) {
      consulta += ' AND Alumnos.apellido_m LIKE ?';
      parametros.push(apellido_m_busqueda+'%');
    }
    if(fechaDeCorteFiltro){
      consulta += ` AND PagoTramites.fechaDeCorte LIKE ?`;
      parametros.push(fechaDeCorteFiltro+'%');
    }
    if(estatusFiltro){
      consulta += ` AND PagoTramites.id_estatus = ?`;
      parametros.push(estatusFiltro);
    }
    if(gradoFiltro) {
      consulta += ' AND Alumnos.grado LIKE ?';
      parametros.push(gradoFiltro+'%');
    }
    if(grupoFiltro) {
      consulta += ' AND Alumnos.grupo LIKE ?';
      parametros.push(grupoFiltro+'%');
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

  exports.printOptionsAlumnos = [(req, res) => {
    const {nombre_busqueda, apellido_p_busqueda, apellido_m_busqueda, noControl_busqueda} = req.body;
    let consulta = `SELECT Alumnos.id, Alumnos.noControl, Alumnos.nombre, Alumnos.apellido_p, Alumnos.apellido_m, Alumnos.grado, Alumnos.grupo
      FROM Alumnos WHERE 1 = 1`;
    let parametros = [];

    if(nombre_busqueda){
      consulta += ` AND Alumnos.nombre LIKE ?`;
      parametros.push(nombre_busqueda+'%');
    }
    if(apellido_p_busqueda){
      consulta += ` AND Alumnos.apellido_p LIKE ?`;
      parametros.push(apellido_p_busqueda+'%');
    }
    if(apellido_m_busqueda){
      consulta += ` AND Alumnos.apellido_m LIKE ?`;
      parametros.push(apellido_m_busqueda+'%');
    }
    if(noControl_busqueda){
      consulta += ` AND Alumnos.noControl LIKE ?`;
      parametros.push(noControl_busqueda + '%');
    }

    db.query(consulta, parametros, (err, result) => {
      if (err){
        res.status(500).json({ error : `Error al imprimir las opciones de alumnos`});
        throw err;
      }
      res.json(result);
    });
  }];