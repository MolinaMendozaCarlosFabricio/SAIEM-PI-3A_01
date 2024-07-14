const express = require('express');
const router = express.Router();
const alumnoController = require('../controllers/alumnos');

//http://localhost:3000/alumnos/
router.get('/', alumnoController.imprimirTablaAlumnos); //Este ya no se va a usar
//http://localhost:3000/alumnos/:id
router.get('/:id', alumnoController.imprimirDatosAlumno); //FUNCIONA
//http://localhost:3000/alumnos/addAlumno
router.post('/addAlumno', alumnoController.addAlumno); //FUNCIONA
//http://localhost:3000/alumnos/comprobarAlumnos
router.post('/comprobarAlumnos', alumnoController.comprobarNoControlAndCurp);
//http://localhost:3000/alumnos/searchAlumnos
router.post('/searchAlumnos', alumnoController.mostrarAlumnos); //FUNCIONA (al fin)
//http://localhost:3000/alumnos/update/:id
router.put('/update/:id', alumnoController.editAlumno); //FUNCIONA
//http://localhost:3000/alumnos/downAlumno/:id
router.put('/downAlumno/:id', alumnoController.bajaAlumno); //FUNCIONA

module.exports = router;