const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verificarRol = require('../middleware/authRol');

// ------------------ CREAR EQUIPO (Cliente) ------------------
router.post('/', verificarRol(['CLIENTE']), (req, res) => {
  const { nombre_equipo, descripcion, numero_serie, ubicacion, anio_fabricacion } = req.body;
  const id_cliente = req.usuarioId;

  if (!nombre_equipo || !numero_serie || !ubicacion) {
    return res.status(400).json({ mensaje: 'Nombre, número de serie y ubicación son obligatorios' });
  }

  const sql = `
    INSERT INTO equipos 
      (nombre_equipo, descripcion, estado_equipo, id_cliente, numero_serie, ubicacion, anio_fabricacion)
    VALUES (?, ?, 'pendiente', ?, ?, ?, ?)
  `;
  db.query(sql, [nombre_equipo, descripcion || '', id_cliente, numero_serie, ubicacion, anio_fabricacion || null], (err) => {
    if (err) {
      console.error('Error al crear equipo:', err);
      return res.status(500).json({ mensaje: 'Error al crear equipo', err });
    }
    res.json({ mensaje: 'Equipo creado correctamente, pendiente de validación' });
  });
});

// ------------------ OBTENER EQUIPOS DEL CLIENTE ------------------
router.get('/cliente/:id', verificarRol(['CLIENTE']), (req, res) => {
  const clienteId = parseInt(req.params.id);

  // Solo el cliente puede ver sus propios equipos
  if (req.usuarioId !== clienteId) {
    return res.status(403).json({ mensaje: 'No autorizado' });
  }

  const sql = `
    SELECT id_equipo, nombre_equipo, descripcion, estado_equipo, numero_serie, ubicacion, anio_fabricacion
    FROM equipos 
    WHERE id_cliente = ?
  `;
  db.query(sql, [clienteId], (err, results) => {
    if (err) {
      console.error('Error en consulta SQL:', err);
      return res.status(500).json({ mensaje: 'Error en la base de datos', err });
    }
    res.json(results);
  });
});

// ------------------ ACTUALIZAR DESCRIPCIÓN DEL EQUIPO (Cliente) ------------------
router.put('/:id', verificarRol(['CLIENTE']), (req, res) => {
  const equipoId = req.params.id;
  const { descripcion } = req.body;

  const sqlCheck = 'SELECT id_cliente FROM equipos WHERE id_equipo = ?';
  db.query(sqlCheck, [equipoId], (err, results) => {
    if (err) return res.status(500).json({ mensaje: 'Error en la base de datos', err });
    if (results.length === 0) return res.status(404).json({ mensaje: 'Equipo no encontrado' });

    if (results[0].id_cliente !== req.usuarioId) {
      return res.status(403).json({ mensaje: 'No autorizado' });
    }

    const sqlUpdate = 'UPDATE equipos SET descripcion = ? WHERE id_equipo = ?';
    db.query(sqlUpdate, [descripcion, equipoId], (err2) => {
      if (err2) return res.status(500).json({ mensaje: 'Error al actualizar descripción', err2 });
      res.json({ mensaje: 'Descripción actualizada correctamente' });
    });
  });
});

// ------------------ OBTENER TODOS LOS EQUIPOS (Admin) ------------------
router.get('/admin', verificarRol(['ADMIN']), (req, res) => {
  const sql = `
    SELECT e.id_equipo, e.nombre_equipo, e.descripcion, e.estado_equipo, e.numero_serie, e.ubicacion, e.anio_fabricacion,
           u.nombre AS nombre_cliente, u.apellido AS apellido_cliente, u.email AS email_cliente
    FROM equipos e
    JOIN usuarios u ON e.id_cliente = u.id_usuario
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ mensaje: 'Error en la base de datos', err });
    res.json(results);
  });
});

// ------------------ ACTUALIZAR ESTADO DE UN EQUIPO (Admin) ------------------
router.put('/admin/:id', verificarRol(['ADMIN']), (req, res) => {
  const equipoId = req.params.id;
  const { estado_equipo } = req.body;

  if (!['pendiente', 'validado', 'rechazado'].includes(estado_equipo)) {
    return res.status(400).json({ mensaje: 'Estado inválido' });
  }

  const sql = 'UPDATE equipos SET estado_equipo = ? WHERE id_equipo = ?';
  db.query(sql, [estado_equipo, equipoId], (err) => {
    if (err) return res.status(500).json({ mensaje: 'Error al actualizar estado', err });
    res.json({ mensaje: 'Estado del equipo actualizado correctamente' });
  });
});

// ------------------ ELIMINAR EQUIPO (Admin) ------------------
router.delete('/admin/:id', verificarRol(['ADMIN']), (req, res) => {
  const equipoId = req.params.id;
  const sql = 'DELETE FROM equipos WHERE id_equipo = ?';
  db.query(sql, [equipoId], (err) => {
    if (err) return res.status(500).json({ mensaje: 'Error al eliminar equipo', err });
    res.json({ mensaje: 'Equipo eliminado correctamente' });
  });
});

module.exports = router;