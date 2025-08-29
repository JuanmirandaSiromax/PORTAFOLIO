
class Usuario {
  constructor(id_usuario, correo, contraseña, rol) {
    this.id_usuario = id_usuario;
    this.correo = correo;
    this.contraseña = contraseña;
    this.rol = rol;
  }
}

module.exports = Usuario;
