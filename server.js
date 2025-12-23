const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. CONFIGURACIÓN CORS
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://minilinkedin-frontend.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Bloqueado por CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// 2. CONEXIÓN INTELIGENTE (Wait for DB)
// Este middleware se asegura de que la DB esté lista antes de procesar nada
app.use(async (req, res, next) => {
    // Si ya estamos conectados, pasamos
    if (mongoose.connection.readyState === 1) {
        return next();
    }

    // Si no, intentamos conectar y ESPERAMOS
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB Conectado en caliente");
        next();
    } catch (error) {
        console.error("❌ Error conectando a DB:", error);
        // Esto te mostrará el error exacto en el navegador si falla
        return res.status(500).json({
            error: 'Error de Conexión a Base de Datos',
            detalle: error.message
        });
    }
});

// 3. RUTAS
app.get('/', (req, res) => {
    // Como usamos el middleware arriba, si llegamos aquí, la DB está conectada SÍ o SÍ
    res.send(`API Funcionando 🚀 | Estado DB: Conectado 🟢`);
});

app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/publicaciones', require('./routes/publicaciones'));
app.use('/api/recursos', require('./routes/recursos'));
app.use('/api/empleos', require('./routes/empleos'));

// 4. ARRANQUE
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server local en puerto ${PORT}`));
}

module.exports = app;