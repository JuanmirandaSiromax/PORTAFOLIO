const express = require('express');
const router = express.Router();
const { 
  registrarUsuario, 
  loginUsuario, 
  obtenerUsuarios, 
  actualizarRolUsuario, 
  eliminarUsuario 
} = require('../controllers/usuarioController');
const verificarRol = require('../middleware/authRol');

// ------------------ AUTENTICACIÓN ------------------

// Registro
router.post('/registro', registrarUsuario);

// Login
router.post('/login', loginUsuario);

// ------------------ USUARIOS (ADMIN) ------------------

// Obtener todos los usuarios
router.get('/admin/usuarios', verificarRol(['ADMIN']), obtenerUsuarios);

// Actualizar rol de un usuario
router.put('/admin/usuarios/:id_usuario', verificarRol(['ADMIN']), actualizarRolUsuario);

// Eliminar usuario
router.delete('/admin/usuarios/:id_usuario', verificarRol(['ADMIN']), eliminarUsuario);

module.exports = router;
