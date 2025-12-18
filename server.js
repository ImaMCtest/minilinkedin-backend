const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

mongoose.set('bufferCommands', false);

const app = express();

if (process.env.NODE_ENV !== 'production') {
    app.use(cors());
}

app.use(express.json());

// ==========================================
// 2. CONEXIÓN A MONGODB (ESTRATEGIA "PROMESA GLOBAL")
// ==========================================
const clientOptions = {
    serverApi: { version: '1', strict: true, deprecationErrors: true },
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
};

// Guardamos la promesa de conexión en una variable
const dbConnection = mongoose.connect(process.env.MONGODB_URI, clientOptions)
    .then(() => console.log('✅ MongoDB Conectado'))
    .catch(err => {
        console.error('❌ Error CRÍTICO MongoDB:', err);
        return null; // Retornamos null para manejarlo abajo
    });

// --- NUEVO: MIDDLEWARE QUE OBLIGA A ESPERAR A LA DB ---
app.use(async (req, res, next) => {
    // Si la conexión no está lista (1 = connected), esperamos la promesa
    if (mongoose.connection.readyState !== 1) {
        try {
            await dbConnection;
        } catch (error) {
            console.error("Error esperando conexión:", error);
        }
    }
    next();
});
// ------------------------------------------------------

// 3. RUTAS
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/publicaciones', require('./routes/publicaciones'));
app.use('/api/recursos', require('./routes/recursos'));
app.use('/api/empleos', require('./routes/empleos'));

// FAVICON
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.get("/favicon.png", (req, res) => res.status(204).end());

// Ruta de prueba
app.get('/', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Conectado 🟢' : 'Desconectado 🔴';
    res.send(`API Mini-LinkedIn funcionando 🚀 | DB: ${dbStatus}`);
});

// 4. ARRANQUE
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
}

module.exports = app;