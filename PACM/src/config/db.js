const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,   // máximo de conexiones simultáneas
  queueLimit: 0          // ilimitadas peticiones en cola
});

// Verificar conexión inicial
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error conectando a MySQL:', err.message);
    process.exit(1);
  } else {
    console.log(`✅ Conectado a MySQL -> BD: ${process.env.DB_NAME}`);
    connection.release();
  }
});

module.exports = pool.promise(); // para usar Promises/async-await
