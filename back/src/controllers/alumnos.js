const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
// Configuración de la base de datos (igual que antes)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});
db.connect((err) => {
  if (err) throw err;
  console.log('Alumnos-Conexión a la BD establecida');
});

// Middleware de autenticación
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

//http://localhost:3000/alumnos/addAlumno
exports.addAlumno = [authenticateJWT, async (req, res) => {
  const {
    nombre, apellido, grado, grupo, noControl, turno, estado, curp, telefono, correo, nombre_tutor,
    telefono_tutor, nivelAcademico, escuelaProcedente, colegioAspirado, carreraAspirada, fechaInicioCurso,
    fechaExamenDiagnostico, nivelMatematico, nivelAnalitico, nivelLinguistico, nivelComprension, 
    nivelGeneral
  } = req.body;


  db.query(
    `INSERT INTO Alumnos (nombre, apellido, grado, grupo, noControl, turno, estado) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nombre, apellido, grado, grupo, noControl, turno, estado],
    (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error('Error al insertar datos principales del alumno:', err);
          res.status(500).send('Error al insertar datos principales del alumno');
        });
      }

      const idQuery = result.insertId;

      db.query(
        `INSERT INTO DatosAdicionalesAlumno (curp, telefono, correo, nombre_tutor, telefono_tutor, nivelAcademico, id_alumnos) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [curp, telefono, correo, nombre_tutor, telefono_tutor, nivelAcademico, idQuery],
        (err, result) => {
          if (err) {
            return db.rollback(() => {
              console.error('Error al insertar datos adicionales del alumno:', err);
              res.status(500).send('Error al insertar datos adicionales del alumno');
            });
          }

          db.query(`INSERT INTO DatosExamenPreUni (escuelaProcedente, colegioAspirado, carreraAspirada, fechaInicioCurso, fechaExamenDiagnostico, nivelMatematico, nivelAnalitico, nivelLinguistico, nivelComprension, nivelGeneral, id_alumnado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`, 
            [escuelaProcedente, colegioAspirado, carreraAspirada, fechaInicioCurso, fechaExamenDiagnostico, nivelMatematico, nivelAnalitico, nivelLinguistico, nivelComprension, nivelGeneral, idQuery],
            (err, result) => {
              if (err) {
                return db.rollback(() => {
                  console.error('Error en la insercion de datos del examen del alumno:', err);
                  res.status(500).send('Error al insertar datos del examen del alumno');
                })
              }
              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    console.error('Error al hacer commit de la transacción:', err);
                    res.status(500).send('Error al hacer commit de la transacción');
                });
              }
              res.status(201).send('Datos del alumno agregados correctamente');
            });
          });
        });
  });
}];

//http://localhost:3000/alumnos/
exports.imprimirTablaAlumnos = [authenticateJWT, (req, res) => {
  db.query(`SELECT * FROM Alumnos`, (err, result) => {
    if (err){
      res.status(500).send('Error al obtener la informacion de los Alumnos');
      throw err;
    }
    res.json(result);
  })
}];

exports.imprimirDatosAlumno = [authenticateJWT, (req, res) => {
  const idALumno = req.params.id;
  db.query(`SELECT a.nombre, a.apellido, a.grado, a.grupo, a.noControl, a.turno, a.estado, d.curp, d.telefono, d.correo, d.nombre_tutor, d.telefono_tutor, d.nivelAcademico, e.escuelaProcedente, e.colegioAspirado, e.carreraAspirada, e.fechaInicioCurso, e.fechaExamenDiagnostico, e.nivelMatematico, e.nivelAnalitico, e.nivelLinguistico, e.nivelComprension, e.nivelGeneral
    FROM Alumnos a
    INNER JOIN DatosAdicionalesAlumno d ON a.id = d.id_alumnos
    INNER JOIN DatosExamenPreUni e ON a.id = e.id_alumnado
    WHERE a.id = ?;`,
    [idALumno], (err, result) => {
      if (err){
        res.status(500).send(`Error al cargar la información del alumno`);
        throw err;
      }
      res.json(result);
    }
  )
}];

//http://localhost:3000/alumnos/searchAlumnos
exports.buscarAlumno = [authenticateJWT, (req, res) => {
  const {nombreBusqueda, apellidoBusqueda, noControlBusqueda} = req.body;
  db.query(`SELECT * FROM Alumnos WHERE nombre = ? or apellido = ?, or noControl = ?`,
    [nombreBusqueda, apellidoBusqueda, noControlBusqueda], (err, result) => {
      if (err){
        res.status(500).send(`Error al buscar informacion de los Alumnos`);
        throw err;
      }
      res.json(result);
    }
  )
}];

//http://localhost:3000/alumnos/update/:id
exports.editAlumno = [authenticateJWT, (req, res) => {
  const idALumno = req.params.id;
  const {
    nombre, apellido, grado, grupo, noControl, turno, estado, curp, telefono, correo, nombre_tutor,
    telefono_tutor, nivelAcademico, escuelaProcedente, colegioAspirado, carreraAspirada, fechaInicioCurso,
    fechaExamenDiagnostico, nivelMatematico, nivelAnalitico, nivelLinguistico, nivelComprension, 
    nivelGeneral
  } = req.body;
  
  db.query(`UPDATE Alumnos SET nombre = ?, apellido = ?, grado = ?, grupo = ?, noControl = ?, turno = ?, estado = ? WHERE id = ?;`,
    [nombre, apellido, grado, grupo, noControl, turno, estado, idALumno],
    (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error('Error al insertar datos principales del alumno:', err);
          res.status(500).send('Error al insertar datos principales del alumno');
        });
      }
      db.query(`UPDATE DatosAdicionalesAlumno SET curp = ?, telefono = ?, correo = ?, nombre_tutor = ?, telefono_tutor = ?, nivelAcademico = ? WHERE id_alumnos = ?;`,
        [curp, telefono, correo, nombre_tutor, telefono_tutor, nivelAcademico, idALumno],
        (err, result) => {
          if (err) {
            return db.rollback(() => {
              console.error('Error al insertar datos secundarios del alumno:', err);
              res.status(500).send('Error al insertar datos secundarios del alumno');
            });
          }
          db.query(`UPDATE DatosExamenPreUni SET escuelaProcedente = ?, colegioAspirado = ?, carreraAspirada = ?, fechaInicioCurso = ?, fechaExamenDiagnostico = ?, nivelMatematico = ?, nivelAnalitico = ?, nivelLinguistico = ?, nivelComprension = ?, nivelGeneral = ? WHERE id_alumnado = ?;`,
            [escuelaProcedente, colegioAspirado, carreraAspirada, fechaInicioCurso, fechaExamenDiagnostico, nivelMatematico, nivelAnalitico, nivelLinguistico, nivelComprension, nivelGeneral, idALumno],
            (err, result) => {
              if (err) {
                return db.rollback(() => {
                  console.error('Error en la insercion de datos del examen del alumno:', err);
                  res.status(500).send('Error al insertar datos del examen del alumno');
                })
              }
              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    console.error('Error al hacer commit de la transacción:', err);
                    res.status(500).send('Error al hacer commit de la transacción');
                });
              }
              res.status(201).send('Datos del alumno agregados correctamente');
          });
        });
    });
  });
}];