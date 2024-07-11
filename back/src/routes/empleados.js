const express = require('express');
const router = express.Router();
const empleadosControllers = require('../controllers/empleados');


//cargo y area

router.get('/viewPersonal',empleadosControllers.getAllPersonal); //sirve
router.post('/addPersonal', empleadosControllers.addPersonal); //sirve
router.put('/updatePersonal/:id', empleadosControllers.updatePersonal); //sirve
router.put('/cancelPersonal/:id', empleadosControllers.cancelPersonal); //sirve

/*router.post('/addC', empleadosControllers.addC);
router.post('/addA', empleadosControllers.addA);*/ 

//PROFESORES
router.get('/viewProfesor',empleadosControllers.getAllProfesores); //FUNCIONAL
router.post('/addProfesor', empleadosControllers.addProfesor); //FUNCIONAL
router.put('/updateProfesor/:id', empleadosControllers.updateProfesor); //FUNCIONAL
router.post('/searchP', empleadosControllers.mostrarProfesores);

router.post('/materias', empleadosControllers.addMaterias); //testing //CHECA COMO FUNCIONA ESTO
router.get('/showMat', empleadosControllers.showMaterias);
//router.post('/especialidad', empleadosControllers.addP);


//agregar materias para profesor, especialidad

module.exports = router;