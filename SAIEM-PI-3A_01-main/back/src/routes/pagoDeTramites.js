const express = require('express');
const router = express.Router();
const tramitesController = require('../controllers/pagoDeTramites');

//PROBANDO
router.get('/view',tramitesController.getAllTramites); //FUNCIONAL
router.post('/add', tramitesController.addTramites); //FUNCIONAL
//faltaria filtrar, buscar y poner como "pagado"

module.exports = router;