const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. CONFIGURACIÓN CORS (Crucial para que el frontend entre)
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

// 2. CONEXIÓN MONGODB (MODO SERVERLESS)
// Eliminamos bufferCommands: false para que Mongoose "espere" si la conexión es lenta
// en lugar de crashear la app.
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB Conectado"))
    .catch(err => console.error("❌ Error Mongo:", err));

// 3. RUTAS
app.get('/', (req, res) => {
    const status = mongoose.connection.readyState === 1 ? 'Conectado 🟢' : 'Desconectado 🔴';
    res.send(`API Funcionando 🚀 | Estado DB: ${status}`);
});

app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/publicaciones', require('./routes/publicaciones'));
app.use('/api/recursos', require('./routes/recursos'));
app.use('/api/empleos', require('./routes/empleos'));

// 4. ARRANQUE SEGURO
// Solo escucha puerto en local. En Vercel, exportamos la app.
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server local en puerto ${PORT}`));
}

module.exports = app;