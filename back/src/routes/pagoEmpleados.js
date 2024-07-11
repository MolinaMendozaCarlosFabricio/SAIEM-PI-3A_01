const express = require('express');
const router = express.Router();
const pagoEControllers = require('../controllers/pagoEmpleados');


router.get('/view',pagoEControllers.getAllPagoE); //FUNCIONAL
router.post('/pagoPro', pagoEControllers.addPagoProfesor); //FUNCIONAL
router.post('/pagoPer', pagoEControllers.addPagoPersonal); //FUNCIONAL

router.post('/searchP', pagoEControllers.searchPersonal);
router.post('/searchPro', pagoEControllers.searchProfesor);
module.exports = router;