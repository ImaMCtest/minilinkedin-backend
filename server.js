const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Conectado'))
    .catch(err => console.error('❌ Error MongoDB:', err));

// 🎯 RUTAS COMPLETAS
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/publicaciones', require('./routes/publicaciones'));
app.use('/api/recursos', require('./routes/recursos')); // ¡ACTIVO!
app.use('/api/empleos', require('./routes/empleos'));   // ¡ACTIVO!

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor Full-Stack corriendo en puerto ${PORT}`));