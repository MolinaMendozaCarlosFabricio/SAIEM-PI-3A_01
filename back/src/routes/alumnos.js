const express = require('express');
const router = express.Router();
const alumnoController = require('../controllers/alumnos');

router.get('/', alumnoController.imprimirTablaAlumnos);
router.post('/addAlumno', alumnoController.addAlumno);
router.get('/searchAlumnos', alumnoController.buscarAlumno); //no funcional aún
router.put('/update/:id', alumnoController.editAlumno);

module.exports = router;