const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LogSistemaSchema = new Schema({
    accion: { type: String, required: true }, // Ej: "LOGIN", "POST_CREADO"
    usuario_id: { type: Schema.Types.ObjectId, ref: 'Usuario' },

    metadata: {
        ip: String,
        navegador: String
    },

    fecha: { type: Date, default: Date.now, expires: '30d' } // Se borra solo a los 30 días
});

module.exports = mongoose.model('LogSistema', LogSistemaSchema);