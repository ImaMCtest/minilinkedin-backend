const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ==========================================
// 1. MIDDLEWARES
// ==========================================
// Configuración de CORS para aceptar peticiones de tu PC y de Vercel
const corsOptions = {
    origin: [
        'http://localhost:5173',                  // Tu Frontend Local
        'https://minilinkedin-frontend.vercel.app' // Tu Frontend en Vercel (¡ACTUALIZA ESTO CUANDO TENGAS LA URL!)
    ],
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
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