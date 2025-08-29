const jwt = require('jsonwebtoken');

const verificarRol = (rolesPermitidos = []) => {
  return (req, res, next) => {
    try {
      // Obtener token del header
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        return res.status(401).json({ mensaje: 'Acceso denegado, token requerido' });
      }

      // Limpiar token si viene con 'Bearer '
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

      // Verificar y decodificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto');

      const { id, rol } = decoded;

      // Verificar si el rol está permitido
      if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(rol.toUpperCase())) {
        return res.status(403).json({ mensaje: 'No tienes permiso para esta acción' });
      }

      // Adjuntar info del usuario al request
      req.usuario = { id, rol };
      next();

    } catch (error) {
      console.error('Error al verificar token:', error);
      return res.status(401).json({ mensaje: 'Token inválido o expirado' });
    }
  };
};

module.exports = verificarRol;
