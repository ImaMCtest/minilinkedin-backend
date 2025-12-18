const express = require('express');
const router = express.Router();
const {
    registrarUsuario,
    loginUsuario,
    eliminarUsuario,
    obtenerPerfil,     // <--- Importar
    actualizarPerfil   // <--- Importar
} = require('../controllers/usuarioController');
const auth = require('../middleware/auth');

// Definir rutas (El prefijo /api/usuarios ya se pone en server.js)
router.post('/registro', registrarUsuario);
router.post('/login', loginUsuario);

// Ruta protegida (Necesita token para borrarse a sí mismo)
router.delete('/me', auth, eliminarUsuario);

// 1. Ver mi propio perfil (Privado)
router.get('/perfil', auth, obtenerPerfil);

// 2. Editar mi perfil (Privado)
router.put('/perfil', auth, actualizarPerfil);

module.exports = router;