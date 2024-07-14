const express = require('express');
const router = express.Router();
const empleadosControllers = require('../controllers/empleados');


//cargo y area

router.get('/viewPersonal',empleadosControllers.getAllPersonal); //sirve
router.post('/addPersonal', empleadosControllers.addPersonal); //sirve
router.put('/updatePersonal/:id', empleadosControllers.updatePersonal); //sirve
router.put('/cancelPersonal/:id', empleadosControllers.cancelPersonal); //sirve
router.post('/searchPer', empleadosControllers.mostrarPersonal);
router.get('/viewSpecificEmploye/:id', empleadosControllers.mostrarDatosEspecificosDelPersonal);
/*router.post('/addC', empleadosControllers.addC);
router.post('/addA', empleadosControllers.addA);*/ 

//PROFESORES
router.get('/viewProfesor',empleadosControllers.getAllProfesores); //FUNCIONAL
router.post('/addProfesor', empleadosControllers.addProfesor); //FUNCIONAL
router.put('/updateProfesor/:id', empleadosControllers.updateProfesor); //FUNCIONAL
router.post('/searchPro', empleadosControllers.mostrarProfesores);
router.get('/viewSpecificTeacher/:id', empleadosControllers.mostrarDatosEspecificosDelProfesor);

router.post('/materias', empleadosControllers.addMaterias); //testing //CHECA COMO FUNCIONA ESTO
router.get('/showMat/:id', empleadosControllers.showMaterias);
router.post('/deltMat', empleadosControllers.deleteMaterias);
//router.post('/especialidad', empleadosControllers.addP);


//agregar materias para profesor, especialidad

module.exports = router;