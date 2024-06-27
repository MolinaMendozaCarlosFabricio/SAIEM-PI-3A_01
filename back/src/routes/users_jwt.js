const express = require('express');
const router = express.Router();
const usersJWTController = require('../controllers/users_jwt');

// Rutas para los endpoints CRUD, TODO FUNCIONAL
router.get('/', usersJWTController.getAllUsers);
router.get('/login', usersJWTController.login);
router.post('/add', usersJWTController.addUser);
router.put('/update/:id', usersJWTController.updateUser);
router.delete('/delete/:id', usersJWTController.deleteUser);

module.exports = router;