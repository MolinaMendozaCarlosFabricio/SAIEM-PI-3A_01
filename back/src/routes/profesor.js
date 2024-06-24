const express = require('express');
const router = express.Router();
const profesorController = require('../controllers/profesor');

router.post('/addProfesor', profesorController.addProfesor);
router.put('/updateProfesor/:id', profesorController.updateProfesor);
router.delete('/deleteProfesor/:id', profesorController.deleteProfesor);

module.exports = router;