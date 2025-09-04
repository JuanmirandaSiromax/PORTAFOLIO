const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const equiposRoutes = require('./routes/equiposRoutes');
const db = require('./config/db');  // <--- importa conexión MySQL
const usuarioRoutes = require('./routes/usuarioRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas API
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/equipos', equiposRoutes);

// Frontend estático
app.use(express.static(path.join(__dirname, '../public')));

// Ruta raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});