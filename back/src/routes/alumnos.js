const express = require('express');
const router = express.Router();
const alumnoController = require('../controllers/alumnos');

router.get('/', alumnoController.imprimirTablaAlumnos);
router.post('/addAlumno', alumnoController.addAlumno);

module.exports = router;