const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PublicacionSchema = new Schema({
    usuario_id: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    contenido: {
        type: String,
        required: true,
        trim: true,
        maxlength: 3000
    },
    es_anonimo: {
        type: Boolean,
        default: false
    },
    fecha_creacion: {
        type: Date,
        default: Date.now
    },

    // 🛡️ NUEVO: HUELLA DIGITAL DE LA PUBLICACIÓN
    // Fundamental para rastrear contenido ilegal o estafas
    auditoria: {
        ip_origen: { type: String, required: true }, // Obligatorio guardar la IP
        dispositivo: { type: String },               // Info del celular/PC
        pais_estimado: { type: String }              // Opcional (se llena con librería GeoIP)
    },

    // Array de comentarios
    comentarios: [
        {
            usuario_id: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
            contenido: { type: String, required: true },
            es_anonimo: { type: Boolean, default: false },
            fecha_creacion: { type: Date, default: Date.now }
            // Nota: Podrías agregar auditoría a los comentarios también si quieres ser muy estricto
        }
    ]
});

module.exports = mongoose.model('Publicacion', PublicacionSchema);