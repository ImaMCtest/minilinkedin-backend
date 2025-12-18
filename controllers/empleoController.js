const Empleo = require('../models/Empleo');

const crearEmpleo = async (req, res) => {
    try {
        const { titulo, empresa, descripcion, modalidad, skills } = req.body;

        const nuevoEmpleo = new Empleo({
            titulo,
            empresa,
            descripcion,
            modalidad,
            skills,
            reclutador_id: req.usuario // El usuario logueado es el reclutador
        });

        await nuevoEmpleo.save();
        res.status(201).json(nuevoEmpleo);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error al publicar empleo');
    }
};

const obtenerEmpleos = async (req, res) => {
    try {
        const empleos = await Empleo.find({ activo: true })
            .populate('reclutador_id', 'nombre titular')
            .sort({ fecha_creacion: -1 });

        res.json(empleos);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar empleos');
    }
};

module.exports = { crearEmpleo, obtenerEmpleos };