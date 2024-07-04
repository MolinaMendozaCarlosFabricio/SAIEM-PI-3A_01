const express = require('express');
const router = express.Router();
const empleadosControllers = require('../controllers/empleados');

//PERSONAL, FUNCIONAL TODO
router.get('/viewPersonal',empleadosControllers.getAllPersonal);
router.post('/addPersonal', empleadosControllers.addPersonal);
router.put('/updatePersonal/:id', empleadosControllers.updatePersonal);
router.put('/cancelPersonal/:id', empleadosControllers.cancelPersonal);

//PROFESORES
router.get('/viewProfesor',empleadosControllers.getAllProfesores); //FUNCIONAL
router.post('/addProfesor', empleadosControllers.addProfesor); //FUNCIONAL
router.put('/updateProfesor/:id', empleadosControllers.updateProfesor); //FUNCIONAL


module.exports = router;