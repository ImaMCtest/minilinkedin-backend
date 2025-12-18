const Publicacion = require('../models/Publicacion');

// =================================================================
// CREAR PUBLICACIÓN (Con Auditoría y Multimedia)
// =================================================================
const crearPublicacion = async (req, res) => {
    const userId = req.usuario; // Viene del token

    if (!userId) return res.status(401).send('Acceso denegado.');

    try {
        // Recibimos los nuevos datos PRO (multimedia, etiquetas)
        const { contenido, es_anonimo, multimedia, etiquetas } = req.body;

        // --- 🛡️ SEGURIDAD: AUDITORÍA DEL POST ---
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '0.0.0.0';
        if (ip.includes('::ffff:')) { ip = ip.split(':').pop(); }
        const dispositivo = req.headers['user-agent'] || 'Desconocido';
        // ----------------------------------------

        const nuevaPublicacion = new Publicacion({
            usuario_id: userId,
            contenido,
            es_anonimo: es_anonimo || false,

            // Nuevos campos del Modelo Pro
            multimedia: multimedia || [], // Array de objetos { url, tipo }
            etiquetas: etiquetas || [],   // Array de strings ['Tesis', 'IA']

            // Datos forenses
            auditoria: {
                ip_origen: ip,
                dispositivo: dispositivo
            }
        });

        const publicacion = await nuevaPublicacion.save();
        res.json(publicacion);

    } catch (err) {
        console.error("Error crear post:", err.message);
        res.status(500).send('Error al crear publicación.');
    }
};

// =================================================================
// OBTENER MURO (Feed)
// =================================================================
const obtenerPublicaciones = async (req, res) => {
    try {
        const publicaciones = await Publicacion.find()
            .sort({ fecha_creacion: -1 }) // Más recientes primero
            .populate('usuario_id', 'nombre avatar_url titular') // Traemos nombre y titular
        // Si quieres traer info de quién comentó, descomenta la siguiente línea:
        // .populate('comentarios.usuario_id', 'nombre'); 

        const muroFormateado = publicaciones.map(p => {
            // Manejo seguro por si el usuario fue borrado
            const autor = p.usuario_id;
            const nombreAutor = autor ? autor.nombre : 'Usuario Eliminado';
            const titularAutor = autor ? autor.titular : '';

            return {
                ...p._doc, // Datos crudos del post
                usuario_id: undefined, // Ocultamos el objeto usuario original por limpieza

                // Lógica de visualización
                autor: {
                    nombre: p.es_anonimo ? 'Usuario Anónimo' : nombreAutor,
                    titular: p.es_anonimo ? '' : titularAutor,
                    id: p.es_anonimo ? null : (autor ? autor._id : null)
                },

                // Contadores útiles para el Frontend
                total_likes: p.likes ? p.likes.length : 0,
                total_comentarios: p.comentarios ? p.comentarios.length : 0
            };
        });

        res.json(muroFormateado);
    } catch (err) {
        console.error("Error feed:", err.message);
        res.status(500).json({ msg: 'Error al cargar el feed', data: [] });
    }
};

module.exports = { crearPublicacion, obtenerPublicaciones };