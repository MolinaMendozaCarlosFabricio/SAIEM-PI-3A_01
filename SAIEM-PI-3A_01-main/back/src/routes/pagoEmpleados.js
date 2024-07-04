const express = require('express');
const router = express.Router();
const pagoEControllers = require('../controllers/pagoEmpleados');

//Probando
router.get('/view',pagoEControllers.getAllPagoE); //FUNCIONAL
router.post('/pagoPro', pagoEControllers.addPagoProfesor); //FUNCIONAL
router.post('/pagoPer', pagoEControllers.addPagoPersonal); //FUNCIONAL

//faltaria filtrar, buscar y poner como "pagado"

module.exports = router;