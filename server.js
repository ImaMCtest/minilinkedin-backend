const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

mongoose.set('bufferCommands', false);

const app = express();

// ==========================================
// 1. CONFIGURACIÓN DE CORS (CORREGIDO)
// ==========================================
// Definimos los orígenes permitidos (Local y tu Vercel)
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://minilinkedin-frontend.vercel.app' // Tu frontend en producción
];

const corsOptions = {
    origin: function (origin, callback) {
        // Permitir solicitudes sin origen (como Postman o Server-to-Server)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Bloqueado por CORS: Origen no permitido'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], // 👈 ESTO SOLUCIONA TU ERROR DE CABECERAS
    credentials: true
};

// Aplicamos CORS globalmente (EN TODOS LOS ENTORNOS)
app.use(cors(corsOptions));
// Habilitar pre-flight para todas las rutas
app.options('*', cors(corsOptions));

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

// --- MIDDLEWARE QUE OBLIGA A ESPERAR A LA DB ---
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

const PORT = process.env.PORT || 5000;

// 4. ARRANQUE (MODIFICADO PARA NO ROMPER VERCEL)
// Usamos "require.main === module" para saber si el archivo se está ejecutando directamente (en tu PC).
// Si es Vercel quien lo importa, este bloque se salta y evitamos el error de puerto.
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    });
}

module.exports = app;