const Recurso = require('../models/Recurso');

// Crear un nuevo recurso (Tesis, Video, Evento)
const crearRecurso = async (req, res) => {
    try {
        const { titulo, tipo, detalles, tags } = req.body;

        // Validación básica
        if (!titulo || !tipo) {
            return res.status(400).json({ msg: 'Título y Tipo son obligatorios' });
        }

        const nuevoRecurso = new Recurso({
            titulo,
            tipo,
            autor_id: req.usuario, // Viene del token
            detalles, // Objeto flexible según el tipo
            tags
        });

        await nuevoRecurso.save();
        res.status(201).json(nuevoRecurso);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error al crear recurso');
    }
};

// Obtener recursos (con filtros opcionales)
const obtenerRecursos = async (req, res) => {
    try {
        // Permitir filtrar por tipo en la URL: ?tipo=VIDEO
        const { tipo } = req.query;
        const filtro = tipo ? { tipo } : {};

        const recursos = await Recurso.find(filtro)
            .populate('autor_id', 'nombre titular avatar_url')
            .sort({ fecha_publicacion: -1 });

        res.json(recursos);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener recursos');
    }
};

module.exports = { crearRecurso, obtenerRecursos };