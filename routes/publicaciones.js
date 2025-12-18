const express = require('express');
const router = express.Router();
const { crearPublicacion, obtenerPublicaciones } = require('../controllers/publicacionController');
const auth = require('../middleware/auth');

// Ruta Pública: Cualquiera puede ver el muro (o agrega 'auth' si quieres que sea privado)
router.get('/', obtenerPublicaciones);

// Ruta Privada: Solo usuarios logueados pueden publicar
router.post('/', auth, crearPublicacion);

module.exports = router;