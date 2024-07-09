const express = require('express');
const router = express.Router();
const tramitesController = require('../controllers/pagoDeTramites');

//PROBANDO
router.get('/view',tramitesController.getAllTramites); //Ya no se usará
router.post('/add', tramitesController.addTramites); //FUNCIONAL


//EN PRUEBA
router.put('/changePaid/:id',tramitesController.changeTramites);
router.put('/changeNext/:id',tramitesController.change2Tramites);
router.put('/changeArrears/:id',tramitesController.change4Tramites);

router.post('/search',tramitesController.buscarORfiltrarTramites);
//faltaria filtrar, buscar y poner como "pagado"
//change para 2 y 4

router.post('/optionsAlumnos', tramitesController.printOptionsAlumnos);
module.exports = router;