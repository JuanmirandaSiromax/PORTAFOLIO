const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario } = require('../controllers/usuarioController');
const verificarRol = require('../middleware/authRol');
const db = require('../config/db');

// ------------------ RUTAS DE AUTENTICACIÓN ------------------

// Registrar usuario
router.post('/registro', registrarUsuario);

// Login
router.post('/login', loginUsuario);

// ------------------ RUTAS DE ADMIN ------------------

// Obtener todos los usuarios (solo admin)
router.get('/admin/usuarios', verificarRol(['ADMIN']), (req, res) => {
  const query = `
    SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.telefono, r.nombre_rol, u.id_rol 
    FROM Usuarios u 
    JOIN Roles r ON u.id_rol = r.id_rol
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: 'Error al obtener usuarios' });
    }
    res.json(results);
  });
});

// Eliminar usuario por ID (solo admin)
router.delete('/admin/usuarios/:id', verificarRol(['ADMIN']), (req, res) => {
  const query = `DELETE FROM Usuarios WHERE id_usuario = ?`;

  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: 'Error al eliminar usuario' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  });
});

// Actualizar rol de usuario por ID (solo admin)
router.put('/admin/usuarios/:id', verificarRol(['ADMIN']), (req, res) => {
  const { id_rol } = req.body;

  // Validar que id_rol exista y sea válido (opcional)
  const rolesValidos = [1, 2, 3]; // ADMIN=1, TECNICO=2, CLIENTE=3, ajusta según tu BD
  if (!rolesValidos.includes(Number(id_rol))) {
    return res.status(400).json({ mensaje: 'Rol inválido' });
  }

  const query = `UPDATE Usuarios SET id_rol = ? WHERE id_usuario = ?`;

  db.query(query, [id_rol, req.params.id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: 'Error al actualizar usuario' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json({ mensaje: 'Usuario actualizado correctamente' });
  });
});

module.exports = router;