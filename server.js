const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// CONFIGURACIÓN MONGOOSE (Para evitar esperas eternas en errores)
mongoose.set('bufferCommands', false);

const app = express();

// ==========================================
// 1. MIDDLEWARES
// ==========================================

// LOGICA CORS HÍBRIDA:
// En Vercel (Production): Usamos las reglas de vercel.json (para no duplicar cabeceras y causar error).
// En Local (Development): Usamos la librería cors() para que funcione tu frontend local.
if (process.env.NODE_ENV !== 'production') {
    app.use(cors());
    console.log('🔧 CORS activado modo Desarrollo');
}

app.use(express.json());

// ==========================================
// 2. CONEXIÓN A MONGODB (MODO VERCEL ROBUSTO)
// ==========================================
const clientOptions = {
    serverApi: { version: '1', strict: true, deprecationErrors: true },
    connectTimeoutMS: 10000, // Si no conecta en 10s, falla rápido
    socketTimeoutMS: 45000,  // Cierra sockets inactivos
};

// Conexión asíncrona pero sin bloquear el arranque de la app
mongoose.connect(process.env.MONGODB_URI, clientOptions)
    .then(() => console.log('✅ MongoDB Conectado'))
    .catch(err => {
        console.error('❌ Error CRÍTICO MongoDB:', err);
        // Opcional: Si no hay DB, el servidor no sirve de mucho, podrías matar el proceso:
        // process.exit(1); 
    });

// ==========================================
// 3. RUTAS
// ==========================================
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/publicaciones', require('./routes/publicaciones'));
app.use('/api/recursos', require('./routes/recursos'));
app.use('/api/empleos', require('./routes/empleos'));

// FAVICON (Evita errores 404 tontos en logs)
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.get("/favicon.png", (req, res) => res.status(204).end());

// Ruta de Salud (Health Check)
app.get('/', (req, res) => {
    // Respondemos con el estado de la base de datos también
    const dbStatus = mongoose.connection.readyState === 1 ? 'Conectado 🟢' : 'Desconectado 🔴';
    res.send(`API Mini-LinkedIn funcionando 🚀 | DB: ${dbStatus}`);
});

// ==========================================
// 4. ARRANQUE DEL SERVIDOR (Híbrido)
// ==========================================
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
}

// Exportación para Vercel
module.exports = app;