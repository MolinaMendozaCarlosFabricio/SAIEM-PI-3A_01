const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
// Configuración de la base de datos (igual que antes)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});
db.connect((err) => {
  if (err) throw err;
  console.log('UsersJWT-Conexión a la BD establecida');
});

exports.login = async (req, res) => {
  const { nombre, password } = req.body;
  db.query('SELECT * FROM Usuarios WHERE nombre = ?', [nombre], async (err, result) => {
    if (err) {
      res.status(500).send('Error en el servidor');
      throw err;
    }
    if (result.length === 0) {
      return res.status(401).send('Sin coincidencias');
    }
    const user = result[0];
    // Verificar contraseña (con bcrypt)
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).send('Credenciales inválidas');
    }
    // Generar JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
};
// Middleware de autenticación
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Prohibido (token inválido)
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401); // No autorizado (sin token)
  }
};
// Rutas protegidas con autenticación JWT
exports.getAllUsers = [authenticateJWT, (req, res) => {
  db.query('SELECT * FROM Usuarios', (err, result) => {
    if (err) {
      res.status(500).send('Error al obtener los usuarios');
      throw err;
    }
    res.json(result);
  });
}];
exports.addUser = [ (req, res) => {
  let {nombre, password, tipo, idpersonal} = req.body;
  // Hashear la contraseña antes de guardarla (bcrypt)

  bcrypt.hash(password, 10, (err, hash) => { // 10 es el número de rondas de hashing
    if (err) {
      res.status(500).send('Error al hashear la contraseña');
      throw err;
    }
    password = hash;

    db.query('INSERT INTO Usuarios (nombre, password, tipo, id_personal) VALUES (?, ?, ?, ?)', 
                 [nombre, hash, tipo, idpersonal], (err, result) => {
            if (err) {
                console.error('Error al agregar el usuario:', err);
                return res.status(500).send('Error al agregar el usuario');
            }
            res.status(201).send('Usuario agregado correctamente');
    });
  });
}];

exports.updateUser = [authenticateJWT, (req, res) => {
  const userId = req.params.id;
  const {nombre, password, tipo} = req.body;
  db.query('UPDATE Usuarios SET nombre = ?, password = ?, tipo = ? WHERE id = ?', [nombre, password, tipo, userId], (err, result) => {
    if (err) {
      res.status(500).send('Error al actualizar el elemento');
      throw err;
    }
    res.send('Elemento actualizado correctamente');
  });
}];

exports.deleteUser = [authenticateJWT, (req, res) => {
  const userId = req.params.id;
  db.query('DELETE FROM Usuarios WHERE id = ?', userId, (err, result) => {
    if (err) {
      res.status(500).send('Error al eliminar el elemento');
      throw err;
    }
    res.send('Elemento eliminado correctamente');
  });
}];