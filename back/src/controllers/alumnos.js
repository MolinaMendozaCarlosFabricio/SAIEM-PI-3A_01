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

exports.comprobarNoControlAndCurp = [(req, res) => {
  const {noControl, curp} = req.body;
  db.query(`SELECT Alumnos.id
    FROM Alumnos
    JOIN DatosAdicionalesAlumno ON Alumnos.id = DatosAdicionalesAlumno.id_alumnos
    WHERE Alumnos.noControl = ? OR DatosAdicionalesAlumno.curp = ?;`, [noControl, curp], (err, result) => {
      if (err) {
        res.status(500).send('Error al buscar coincidencias en Alumnos');
        return res.status(500).json({ error : "Error al buscar coincidencias en Alumnos"});
      }
      res.json(result);
    })
}];

//http://localhost:3000/alumnos/addAlumno
exports.addAlumno = [/*authenticateJWT,*/ async (req, res) => {
  const {
    nombre, apellido_p, apellido_m, grado, grupo, turno, noControl, estado, curp, telefono, correo, 
    nombre_tutor, apellido_p_tutor, apellido_m_tutor, telefono_tutor, nivelAcademico, escuelaProcedente, 
    colegioAspirado, carreraAspirada, fechaInicioCurso, fechaExamenDiagnostico, nivelMatematico, 
    nivelAnalitico, nivelLinguistico, nivelComprension, nivelGeneral
  } = req.body;

  db.beginTransaction((err) => {
    if (err) {
      console.error('Error al iniciar la transacción:', err);
      return res.status(500).json({ error: 'Error al iniciar la transacción' });
    }

    db.query(
      `INSERT INTO Alumnos (nombre, apellido_p, apellido_m, grado, grupo, id_turno, noControl, id_estatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido_p, apellido_m, grado, grupo, turno, noControl, estado],
      (err, result) => {
        if (err) {
          return db.rollback(() => {
            console.error('Error al insertar datos principales del alumno:', err);
            res.status(500).json({ error: 'Error al insertar datos principales del alumno' });
          });
        }

        const idQuery = result.insertId;

        db.query(
          `INSERT INTO DatosAdicionalesAlumno (curp, telefono, correo, nombre_tutor, apellidoP_tutor, apellidoM_tutor, telefono_tutor, nivelAcademico, id_alumnos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [curp, telefono, correo, nombre_tutor, apellido_p_tutor, apellido_m_tutor, telefono_tutor, nivelAcademico, idQuery],
          (err, result) => {
            if (err) {
              return db.rollback(() => {
                console.error('Error al insertar datos adicionales del alumno:', err);
                res.status(500).json({ error: 'Error al insertar datos adicionales del alumno' });
              });
            }

            db.query(`INSERT INTO DatosExamenPreUni (escuelaProcedente, colegioAspirado, carreraAspirada, fechaInicioCurso, fechaExamenDiagnostico, nivelMatematico, nivelAnalitico, nivelLinguistico, nivelComprension, nivelGeneral, id_alumnado)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`, 
              [escuelaProcedente, colegioAspirado, carreraAspirada, fechaInicioCurso, fechaExamenDiagnostico, nivelMatematico, nivelAnalitico, nivelLinguistico, nivelComprension, nivelGeneral, idQuery],
              (err, result) => {
                if (err) {
                  return db.rollback(() => {
                    console.error('Error en la insercion de datos del examen del alumno:', err);
                    res.status(500).json({ error: 'Error al insertar datos del examen del alumno' });
                  });
                }

                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => {
                      console.error('Error al hacer commit de la transacción:', err);
                      res.status(500).json({ error: 'Error al hacer commit de la transacción' });
                    });
                  }
                  res.status(201).json({ message: 'Datos del alumno agregados correctamente' });
                });
              }
            );
          }
        );
      }
    );
  });
}];

//http://localhost:3000/alumnos/
exports.imprimirTablaAlumnos = [/*authenticateJWT,*/ (req, res) => {
  db.query(`SELECT Alumnos.id, Alumnos.nombre, Alumnos.apellido_p, Alumnos.apellido_m, Alumnos.grado, Alumnos.grupo, Turno.turno, Alumnos.noControl, EstatusPersona.tipo_estatus 
    FROM Alumnos
    JOIN Turno ON Alumnos.id_turno = Turno.id
    JOIN EstatusPersona ON Alumnos.id_estatus = EstatusPersona.id`, 
    (err, result) => {
    if (err){
      res.status(500).json({ error : 'Error al obtener la informacion de los Alumnos'});
      throw err;
    }
    res.json(result);
  })
}];

//http://localhost:3000/alumnos/:id
exports.imprimirDatosAlumno = [/*authenticateJWT,*/ (req, res) => {
  const idALumno = req.params.id;
  db.query(`SELECT Alumnos.id, Alumnos.nombre, Alumnos.apellido_p, Alumnos.apellido_m, Alumnos.grado, Alumnos.grupo, Turno.turno, Alumnos.noControl, EstatusPersona.tipo_estatus, DatosAdicionalesAlumno.curp, DatosAdicionalesAlumno.telefono, DatosAdicionalesAlumno.correo, DatosAdicionalesAlumno.nombre_tutor, DatosAdicionalesAlumno.apellidoP_tutor, DatosAdicionalesAlumno.apellidoM_tutor, DatosAdicionalesAlumno.telefono_tutor, DatosAdicionalesAlumno.nivelAcademico, DatosExamenPreUni.escuelaProcedente, DatosExamenPreUni.colegioAspirado, DatosExamenPreUni.carreraAspirada, DatosExamenPreUni.fechaInicioCurso, DatosExamenPreUni.fechaExamenDiagnostico, DatosExamenPreUni.nivelMatematico, DatosExamenPreUni.nivelAnalitico, DatosExamenPreUni.nivelLinguistico, DatosExamenPreUni.nivelComprension, DatosExamenPreUni.nivelGeneral
    FROM Alumnos, Turno, EstatusPersona, DatosAdicionalesAlumno, DatosExamenPreUni WHERE Alumnos.id_turno = Turno.id and Alumnos.id_estatus = EstatusPersona.id and Alumnos.id = DatosAdicionalesAlumno.id_alumnos and Alumnos.id = DatosExamenPreUni.id_alumnado and Alumnos.id = ?;`,
    [idALumno], (err, result) => {
      if (err){
        res.status(500).json({ error : `Error al cargar la información del alumno`});
        throw err;
      }
      res.json(result);
    }
  )
}];

//http://localhost:3000/alumnos/searchAlumnos
exports.mostrarAlumnos = [/*authenticateJWT,*/ (req, res) => {
  const {nombre_busqueda, apellido_p_busqueda, apellido_m_busqueda, noControlBusqueda, gradoFiltro, grupoFiltro, estatusFiltro} = req.body;
  let consulta = `SELECT Alumnos.id, Alumnos.nombre, Alumnos.apellido_p, Alumnos.apellido_m, Alumnos.grado, Alumnos.grupo, Turno.turno, Alumnos.noControl, EstatusPersona.tipo_estatus 
    FROM Alumnos
    JOIN Turno ON Alumnos.id_turno = Turno.id
    JOIN EstatusPersona ON Alumnos.id_estatus = EstatusPersona.id
    WHERE 1 = 1`;
  let parametros = [];

  if(nombre_busqueda){
    consulta += ` AND Alumnos.nombre LIKE ?`;
    parametros.push(nombre_busqueda+'%');
  }
  if (apellido_p_busqueda){
    consulta += ` AND Alumnos.apellido_p LIKE ?`;
    parametros.push(apellido_p_busqueda+'%');
  }
  if(apellido_m_busqueda){
    consulta += ` AND Alumnos.apellido_m LIKE ?`;
    parametros.push(apellido_m_busqueda+'%');
  }
  if(noControlBusqueda){
    consulta += ` AND Alumnos.noControl LIKE ?`;
    parametros.push(noControlBusqueda + '%');
  }
  if(gradoFiltro){
    consulta += ` AND Alumnos.grado = ?`;
    parametros.push(gradoFiltro);
  }
  if(grupoFiltro){
    consulta += ` AND Alumnos.grupo LIKE ?`;
    parametros.push('%'+grupoFiltro+'%');
  }
  if(estatusFiltro){
    consulta += ` AND Alumnos.id_estatus = ?`;
    parametros.push(estatusFiltro);

  }
  
  db.query(consulta, parametros, (err, result) => {
      if (err){
        res.status(500).json({ error : `Error al buscar informacion de los Alumnos`});
        throw err;
      }
      res.json(result);
    }
  )
  
}];

//http://localhost:3000/alumnos/update/:id
exports.editAlumno = [/*authenticateJWT,*/ (req, res) => {
  const idALumno = req.params.id;
  const {
    nombre, apellido_p, apellido_m, grado, grupo, turno, noControl, estado, curp, telefono, correo, 
    nombre_tutor, apellido_p_tutor, apellido_m_tutor, telefono_tutor, nivelAcademico, escuelaProcedente, 
    colegioAspirado, carreraAspirada, fechaInicioCurso, fechaExamenDiagnostico, nivelMatematico, 
    nivelAnalitico, nivelLinguistico, nivelComprension, nivelGeneral
  } = req.body;
  
  db.query(`UPDATE Alumnos SET nombre = ?, apellido_p = ?, apellido_m = ?, grado = ?, grupo = ?, id_turno = ?, noControl = ?, id_estatus = ? WHERE id = ?;`,
    [nombre, apellido_p, apellido_m, grado, grupo, turno, noControl, estado, idALumno],
    (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error('Error al insertar datos principales del alumno:', err);
          res.status(500).json({ error: 'Error al insertar datos principales del alumno' });
        });
      }
      db.query(`UPDATE DatosAdicionalesAlumno SET curp = ?, telefono = ?, correo = ?, nombre_tutor = ?, apellidoP_tutor = ?, apellidoM_tutor = ?, telefono_tutor = ?, nivelAcademico = ? WHERE id_alumnos = ?;`,
        [curp, telefono, correo, nombre_tutor, apellido_p_tutor, apellido_m_tutor, telefono_tutor, nivelAcademico, idALumno],
        (err, result) => {
          if (err) {
            return db.rollback(() => {
              console.error('Error al insertar datos secundarios del alumno:', err);
              res.status(500).json({ error: 'Error al insertar datos secundarios del alumno' });
            });
          }
          db.query(`UPDATE DatosExamenPreUni SET escuelaProcedente = ?, colegioAspirado = ?, carreraAspirada = ?, fechaInicioCurso = ?, fechaExamenDiagnostico = ?, nivelMatematico = ?, nivelAnalitico = ?, nivelLinguistico = ?, nivelComprension = ?, nivelGeneral = ? WHERE id_alumnado = ?;`,
            [escuelaProcedente, colegioAspirado, carreraAspirada, fechaInicioCurso, fechaExamenDiagnostico, nivelMatematico, nivelAnalitico, nivelLinguistico, nivelComprension, nivelGeneral, idALumno],
            (err, result) => {
              if (err) {
                return db.rollback(() => {
                  console.error('Error en la insercion de datos del examen del alumno:', err);
                  res.status(500).json({ error: 'Error al insertar datos del examen del alumno' });
                })
              }
              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    console.error('Error al hacer commit de la transacción:', err);
                    res.status(500).json({ error: 'Error al hacer commit de la transacción' });
                  });
                }
                res.status(201).json({ message: 'Datos del alumno agregados correctamente' });
              });
            });
        });
      });
}];

//http://localhost:3000/alumnos/downAlumno/:id
exports.bajaAlumno = [/*authenticateJWT,*/ (req, res) => {
  const idALumno = req.params.id;
  db.query(`UPDATE Alumnos SET id_estatus = 3 WHERE id = ?;`, [idALumno],
    (err, result) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ error : 'Error al dar de baja al alumno'});
        });
      }
      res.status(201).json({ message : 'Alumno dado de baja'})
    }
  );
}];