const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RecursoSchema = new Schema({
    titulo: { type: String, required: true },
    tipo: {
        type: String,
        enum: ['TESIS', 'VIDEO', 'ARTICULO', 'EVENTO'],
        required: true
    },
    autor_id: { type: Schema.Types.ObjectId, ref: 'Usuario' },

    // Polimorfismo: Datos que cambian según el tipo
    detalles: {
        universidad: String,      // Para Tesis
        url_pdf: String,          // Para Tesis/Artículos
        // --- AGREGA ESTA LÍNEA ---
        url_video: String,        // <--- ¡FALTABA ESTO!
        // -------------------------
        duracion: String,         // Para Videos
        plataforma: String,       // Para Videos (YouTube)
        fecha_evento: Date,       // Para Eventos
        link_reunion: String      // Para Eventos
    },

    tags: [String], // Para búsquedas rápidas
    fecha_publicacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recurso', RecursoSchema);