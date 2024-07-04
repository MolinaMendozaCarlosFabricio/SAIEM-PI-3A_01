const express = require('express');
const router = express.Router();
const alumnoController = require('../controllers/alumnos');


router.get('/', alumnoController.imprimirTablaAlumnos); //NO FUNCIONA
//http://localhost:3000/alumnos/:id
router.get('/:id', alumnoController.imprimirDatosAlumno); //FUNCIONA
//http://localhost:3000/alumnos/addAlumno
router.post('/addAlumno', alumnoController.addAlumno); //FUNCIONA
router.get('/searchAlumnos', alumnoController.buscarAlumno); //NO funcional aún
//http://localhost:3000/alumnos/update/:id
router.put('/update/:id', alumnoController.editAlumno); //FUNCIONA
router.put('/downAlumno/:id', alumnoController.bajaAlumno); //NO FUNCIONA

module.exports = router;