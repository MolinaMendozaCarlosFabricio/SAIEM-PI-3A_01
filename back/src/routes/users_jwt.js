const express = require('express');
const router = express.Router();
const usersJWTController = require('../controllers/users_jwt');

// Rutas para los endpoints CRUD, TODO FUNCIONAL
//http://localhost:3000/usersJWT/
router.get('/', usersJWTController.getAllUsers);
//http://localhost:3000/usersJWT/login
router.post('/login', usersJWTController.login);
//http://localhost:3000/usersJWT/verify/:id
router.get('/verify/:id', usersJWTController.verifyUser);
//http://localhost:3000/usersJWT/add
router.post('/add', usersJWTController.addUser);
//http://localhost:3000/usersJWT/compUser
router.post('/compUser', usersJWTController.comprobarSiExisteUnUsuario);
//http://localhost:3000/usersJWT/getEmployes
router.get('/getEmployes', usersJWTController.selectionEmploye);
//http://localhost:3000/usersJWT/update:id
router.put('/update/:id', usersJWTController.updateUser);
//http://localhost:3000/usersJWT/delete:id
router.delete('/delete/:id', usersJWTController.deleteUser);

module.exports = router;