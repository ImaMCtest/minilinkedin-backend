const express = require('express');
const router = express.Router();
const { crearEmpleo, obtenerEmpleos } = require('../controllers/empleoController');
const auth = require('../middleware/auth');

// GET /api/empleos (Público)
router.get('/', obtenerEmpleos);

// POST /api/empleos (Privado)
router.post('/', auth, crearEmpleo);

module.exports = router;