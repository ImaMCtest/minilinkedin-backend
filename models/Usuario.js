const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Sub-Schema para Experiencia (Vital para LinkedIn)
const ExperienciaSchema = new Schema({
    puesto: String,          // Ej: Practicante Backend
    empresa: String,         // Ej: Google
    fecha_inicio: Date,
    fecha_fin: Date,
    actualmente: Boolean,
    descripcion: String      // Palabras clave para tu algoritmo
}, { _id: true });

const UsuarioSchema = new Schema({
    // --- 1. IDENTIDAD BÁSICA ---
    nombre: { type: String, required: true, trim: true }, // Nombre Real
    username: { type: String, unique: true, sparse: true }, // Para la URL (juan-perez-123)
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },

    // --- 2. PERFIL PROFESIONAL (Visual + SEO) ---
    titular: { type: String, maxlength: 220 }, // Ej: "Full Stack Dev | Open Source"
    resumen: { type: String, maxlength: 2000 }, // El "Acerca de mí"
    avatar_url: { type: String, default: 'default_avatar.png' },
    banner_url: { type: String },

    // --- 3. DATOS PARA TU ALGORITMO DE RECOMENDACIÓN ---
    ubicacion: {
        pais: String,
        ciudad: String
    },
    // Etiquetas clave para filtrar el feed (Ej: ['Javascript', 'Becas', 'Tesis'])
    intereses: [String],

    // Estado para reclutadores (Ej: 'Buscando activamente', 'Abierto a ofertas', 'No interesado')
    estado_busqueda: {
        type: String,
        enum: ['ACTIVO', 'PASIVO', 'CERRADO'],
        default: 'PASIVO'
    },

    // --- 4. TRAYECTORIA ---
    universidad: String,
    carrera: String,
    habilidades: [String], // Skills validables
    idiomas: [String],
    proyectos: [ // Tu schema anterior (Mantenlo, es bueno)
        {
            nombre: String,
            descripcion: String,
            tecnologias: [String],
            url_repositorio: String,
            fecha_realizacion: Date
        }
    ],
    experiencia: [ExperienciaSchema], // Nueva sección laboral

    // --- 5. SOCIAL GRAPH (La Red) ---
    // A quién sigue para llenar su Feed
    siguiendo: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }],
    seguidores: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }],

    // --- 6. SEGURIDAD Y METADATA (Lo que hablamos antes) ---
    fecha_registro: { type: Date, default: Date.now },
    ultimo_acceso: { type: Date }, // Para saber si es "fantasma" o activo

    metadata_registro: {
        ip: String,
        dispositivo: String,
        navegador: String
    },

    // Configuración de Privacidad
    ajustes: {
        perfil_publico: { type: Boolean, default: true },
        mostrar_email: { type: Boolean, default: false }
    }
});

// Índice para búsquedas rápidas de texto (Buscador de personas)
UsuarioSchema.index({ nombre: 'text', titular: 'text', habilidades: 'text' });

module.exports = mongoose.model('Usuario', UsuarioSchema);