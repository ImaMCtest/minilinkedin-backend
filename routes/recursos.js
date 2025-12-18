const express = require('express');
const router = express.Router();
const { crearRecurso, obtenerRecursos } = require('../controllers/recursoController');
const auth = require('../middleware/auth');

// GET /api/recursos (Público)
router.get('/', obtenerRecursos);

// POST /api/recursos (Privado - Solo usuarios logueados)
router.post('/', auth, crearRecurso);

module.exports = router;