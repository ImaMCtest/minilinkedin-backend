const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// En tu server.js
app.use(cors());
// Opcional: Si quieres ser ultra específico, asegúrate que las opciones estén así:
// app.use(cors({ origin: '*', optionsSuccessStatus: 200 }));

app.use(express.json());

// ==========================================
// 2. CONEXIÓN A MONGODB
// ==========================================
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Conectado'))
    .catch(err => console.error('❌ Error MongoDB:', err));

// ==========================================
// 3. RUTAS
// ==========================================
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/publicaciones', require('./routes/publicaciones'));
app.use('/api/recursos', require('./routes/recursos'));
app.use('/api/empleos', require('./routes/empleos'));

// FAVICON (EVITA CRASH)
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.get("/favicon.png", (req, res) => res.status(204).end());

// Ruta de prueba para ver si el servidor vive
app.get('/', (req, res) => res.send('API Mini-LinkedIn funcionando 🚀'));

// ==========================================
// 4. ARRANQUE DEL SERVIDOR (Híbrido)
// ==========================================
const PORT = process.env.PORT || 5000;

// Lógica Inteligente:
// Si estamos en desarrollo (NODE_ENV no es 'production'), escuchamos el puerto.
// Si estamos en Vercel, NO escuchamos el puerto (Vercel lo hace por nosotros).
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
}

// Para Vercel necesitamos exportar la 'app'
module.exports = app;