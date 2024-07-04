const express = require('express');
const router = express.Router();
const alumnoController = require('../controllers/alumnos');


router.get('/', alumnoController.imprimirTablaAlumnos); //NO FUNCIONA
//http://localhost:3000/alumnos/:id
router.get('/:id', alumnoController.imprimirDatosAlumno); //NO FUNCIONA
//http://localhost:3000/alumnos/addAlumno
router.post('/addAlumno', alumnoController.addAlumno); //NO FUNCIONA
router.get('/searchAlumnos', alumnoController.buscarAlumno); //NO funcional aún
router.put('/update/:id', alumnoController.editAlumno); //NO FUNCIONA
router.put('/downAlumno/:id', alumnoController.bajaAlumno); //NO FUNCIONA

module.exports = router;