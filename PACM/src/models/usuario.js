const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  correo: {
    type: String,
    required: true,
    unique: true
  },
  contraseña: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ['admin', 'tecnico', 'cliente'], // solo roles válidos
    default: 'tecnico'
  }
});

module.exports = mongoose.model('Usuario', UsuarioSchema);