const express = require('express');
const router = express.Router();
const tramitesController = require('../controllers/pagoDeTramites');

//PROBANDO
router.get('/view',tramitesController.getAllTramites); //FUNCIONAL
router.post('/add', tramitesController.addTramites); //FUNCIONAL
//faltaria filtrar y buscar

module.exports = router;