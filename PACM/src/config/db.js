const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

// Intentar conectar
db.connect(err => {
  if (err) {
    console.error('❌ Error conectando a MySQL:', err.message);
    process.exit(1); // salir si no conecta
  } else {
    console.log(`✅ Conectado a MySQL -> BD: ${process.env.DB_NAME}`);
  }
});

module.exports = db;