require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Hotel Para Mascotas Backend' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Health check en http://localhost:${PORT}/health`);
});

module.exports = app;