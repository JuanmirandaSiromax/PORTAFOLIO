// src/routes/usuarioRoutes.js
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
    SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.telefono, 
           u.rut_empresa, u.nombre_empresa, u.direccion_empresa,
           r.nombre_rol, u.id_rol 
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
      return res.status(500).json({ mensaje: 'Error al eliminar usuario Cliente tiene Equipos Registrados' });
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

  // Validar que id_rol sea válido
  const rolesValidos = [1, 2, 3]; // ADMIN=1, TECNICO=2, CLIENTE=3
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

// ------------------ RUTAS DE CLIENTE ------------------

// Obtener perfil de usuario
router.get('/:id', (req, res) => {
  const query = `
    SELECT id_usuario, nombre, apellido, email, telefono, 
           rut_empresa, nombre_empresa, direccion_empresa, id_rol 
    FROM Usuarios 
    WHERE id_usuario = ?
  `;

  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: 'Error al obtener usuario' });
    }
    if (results.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json(results[0]);
  });
});

// Actualizar perfil de usuario
router.put('/:id', (req, res) => {
  const { nombre, apellido, telefono, rut_empresa, nombre_empresa, direccion_empresa } = req.body;

  const query = `
    UPDATE Usuarios 
    SET nombre = ?, apellido = ?, telefono = ?, 
        rut_empresa = ?, nombre_empresa = ?, direccion_empresa = ?
    WHERE id_usuario = ?
  `;

  db.query(query, [nombre, apellido, telefono, rut_empresa, nombre_empresa, direccion_empresa, req.params.id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: 'Error al actualizar usuario' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json({ mensaje: 'Perfil actualizado correctamente' });
  });
});
// Eliminar usuario por ID (solo admin)
router.delete('/admin/usuarios/:id', verificarRol(['ADMIN']), (req, res) => {
  const userId = req.params.id;

  // 1. Verificar si el usuario tiene equipos asociados
  const checkEquipos = 'SELECT COUNT(*) AS total FROM equipos WHERE id_cliente = ?';
  db.query(checkEquipos, [userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: 'Error verificando equipos asociados' });
    }

    if (result[0].total > 0) {
      return res.status(400).json({ 
        mensaje: 'No se puede eliminar, el usuario tiene equipos asociados' 
      });
    }

    // 2. Si no tiene equipos, eliminar el usuario
    const deleteUsuario = 'DELETE FROM usuarios WHERE id_usuario = ?';
    db.query(deleteUsuario, [userId], (err, result) => {
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
});

module.exports = router;