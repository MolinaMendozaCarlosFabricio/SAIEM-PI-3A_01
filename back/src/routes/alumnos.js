const express = require('express');
const router = express.Router();
const alumnoController = require('../controllers/alumnos');


router.get('/', alumnoController.imprimirTablaAlumnos); //FUNCIONA
router.get('/:id', alumnoController.imprimirDatosAlumno); //FUNCIONA
router.post('/addAlumno', alumnoController.addAlumno); //FUNCIONA
router.get('/searchAlumnos', alumnoController.buscarAlumno); //no funcional aún
router.put('/update/:id', alumnoController.editAlumno); //FUNCIONA
router.put('/downAlumno/:id', alumnoController.bajaAlumno); //FUNCIONA

module.exports = router;