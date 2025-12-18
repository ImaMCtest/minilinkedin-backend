const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmpleoSchema = new Schema({
    titulo: { type: String, required: true },
    empresa: { type: String, required: true },
    descripcion: String,
    modalidad: { type: String, enum: ['REMOTO', 'PRESENCIAL', 'HIBRIDO'] },
    skills: [String],

    reclutador_id: { type: Schema.Types.ObjectId, ref: 'Usuario' },

    // Optimización: Guardamos solo los últimos 5 postulantes para vista rápida
    postulantes_preview: [{
        usuario_id: { type: Schema.Types.ObjectId, ref: 'Usuario' },
        nombre: String,
        fecha: Date
    }],

    activo: { type: Boolean, default: true },
    fecha_creacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Empleo', EmpleoSchema);