const express = require('express');
const router = express.Router();
const pagoEControllers = require('../controllers/pagoEmpleados');


router.get('/view',pagoEControllers.getAllPagoE); //FUNCIONAL
router.post('/pagoPro', pagoEControllers.addPagoProfesor); //FUNCIONAL
router.post('/pagoPer', pagoEControllers.addPagoPersonal); //FUNCIONAL

router.post('/searchP', pagoEControllers.searchPersonal);
router.post('/searchPro', pagoEControllers.searchProfesor);

router.put('/pagado/:id', pagoEControllers.pagoPagado);
router.put('/proximo/:id', pagoEControllers.pagoProximo);
router.put('/atrasado/:id', pagoEControllers.pagoAtrasado);

router.post('/optionPersonal', pagoEControllers.printOptionPersonal);
router.post('/optionProfesor', pagoEControllers.printOptionProfesor);

module.exports = router;