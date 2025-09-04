const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ------------------ REGISTRAR USUARIO ------------------
const registrarUsuario = async (req, res) => {
  const { nombre, apellido, email, password, telefono, rol } = req.body; // rol viene como texto

  if (!nombre || !apellido || !email || !password || !telefono || !rol) {
    return res.status(400).json({ mensaje: 'Faltan campos requeridos' });
  }

  // 👇 Validar formato del teléfono (solo números y 8-15 dígitos)
  const telefonoRegex = /^[0-9]{8,15}$/;
  if (!telefonoRegex.test(telefono)) {
    return res.status(400).json({ mensaje: 'Teléfono no válido (solo dígitos, entre 8 y 15 caracteres)' });
  }


  try {
    // Verificar si ya existe el email
    db.query('SELECT * FROM Usuarios WHERE email = ?', [email], async (err, results) => {
      if (err) return res.status(500).json({ mensaje: 'Error en la base de datos' });
      if (results.length > 0) {
        return res.status(400).json({ mensaje: 'El correo ya está registrado' });
      }

      // Buscar id_rol según el nombre del rol (en mayúsculas)
      const rolFormateado = rol.trim().toUpperCase();

      db.query('SELECT id_rol FROM Roles WHERE nombre_rol = ?', [rolFormateado], async (err, rolResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ mensaje: 'Error al verificar rol' });
        }

        if (rolResults.length === 0) {
          return res.status(400).json({ mensaje: 'Rol no válido' });
        }

        const id_rol = rolResults[0].id_rol;

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar usuario en la base de datos
        const query = `INSERT INTO Usuarios (nombre, apellido, email, password, telefono, id_rol) 
                       VALUES (?, ?, ?, ?, ?, ?)`;

        db.query(query, [nombre, apellido, email, hashedPassword, telefono || null, id_rol], (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ mensaje: 'Error al registrar usuario' });
          }
          res.status(201).json({ mensaje: 'Usuario registrado con éxito', id: result.insertId });
        });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

// ------------------ OBTENER USUARIO ------------------
const obtenerUsuarios = (req, res) => {
  const query = `
    SELECT u.id_usuario, u.nombre, u.apellido, u.email, r.nombre_rol 
    FROM Usuarios u
    JOIN Roles r ON u.id_rol = r.id_rol
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ mensaje: 'Error al obtener usuarios' });
    res.json(results);
  });
};
// ------------------ ACTUALIZAR USUARIO ------------------
const actualizarRolUsuario = (req, res) => {
  const { id_usuario } = req.params;
  const { id_rol } = req.body;

  const query = `UPDATE Usuarios SET id_rol = ? WHERE id_usuario = ?`;

  db.query(query, [id_rol, id_usuario], (err, result) => {
    if (err) return res.status(500).json({ mensaje: 'Error al actualizar rol' });
    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json({ mensaje: 'Rol actualizado correctamente' });
  });
};
// ------------------ ELIMINAR USUARIO ------------------
const eliminarUsuario = (req, res) => {
  const { id_usuario } = req.params;

  const query = `DELETE FROM Usuarios WHERE id_usuario = ?`;

  db.query(query, [id_usuario], (err, result) => {
    if (err) return res.status(500).json({ mensaje: 'Error al eliminar usuario Cliente tiene Equipos Registrados' });
    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  });
};
// ------------------ LOGIN USUARIO ------------------
const loginUsuario = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Consulta para traer usuario junto con nombre del rol
    const query = `
      SELECT u.*, r.nombre_rol 
      FROM Usuarios u
      JOIN Roles r ON u.id_rol = r.id_rol
      WHERE u.email = ?
    `;

    db.query(query, [email], async (err, results) => {
      if (err) return res.status(500).json({ mensaje: 'Error en la base de datos' });

      if (results.length === 0) {
        return res.status(400).json({ mensaje: 'Usuario no encontrado' });
      }

      const usuario = results[0];

      // Comparar contraseña con bcrypt
      const esValida = await bcrypt.compare(password, usuario.password);
      if (!esValida) {
        return res.status(400).json({ mensaje: 'Contraseña incorrecta' });
      }

      // Generar token JWT
      const token = jwt.sign(
        { id: usuario.id_usuario, rol: usuario.id_rol },
        process.env.JWT_SECRET || 'secreto',
        { expiresIn: '1h' }
      );

      // Responder con datos de usuario + token + nombre del rol
      res.json({
        mensaje: 'Login exitoso',
        token,
        usuario: {
          id: usuario.id_usuario,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          rol: usuario.nombre_rol
        }
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

module.exports = { registrarUsuario, loginUsuario };