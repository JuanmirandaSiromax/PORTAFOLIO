const jwt = require('jsonwebtoken');
const db = require('../config/db');

const verificarRol = (rolesPermitidos = []) => {
  return (req, res, next) => {
    try {
      // Obtener token del header Authorization
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        return res.status(401).json({ mensaje: 'Acceso denegado, token requerido' });
      }

      // Limpiar token si viene con 'Bearer '
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

      // Verificar y decodificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto');
      const idUsuario = decoded.id;
      const idRol = decoded.rol;

      // Consultar nombre del rol en la BD
      db.query('SELECT nombre_rol FROM Roles WHERE id_rol = ?', [idRol], (err, results) => {
        if (err) {
          console.error('Error en la consulta de rol:', err);
          return res.status(500).json({ mensaje: 'Error interno en la verificación de rol' });
        }

        if (results.length === 0) {
          return res.status(403).json({ mensaje: 'Rol no válido' });
        }

        const nombreRol = results[0].nombre_rol;

        // Verificar si el rol está permitido
        if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(nombreRol)) {
          return res.status(403).json({ mensaje: 'No tienes permiso para esta acción' });
        }

        // Adjuntar info útil al request para usarla después
        req.usuario = { id: idUsuario, rol: nombreRol };
        next();
      });

    } catch (error) {
      console.error('Error al verificar token:', error);
      return res.status(401).json({ mensaje: 'Token inválido o expirado' });
    }
  };
};

module.exports = verificarRol;