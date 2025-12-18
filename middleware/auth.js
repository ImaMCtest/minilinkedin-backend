const jwt = require('jsonwebtoken');

// Usa la misma lógica del controlador para la clave secreta
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_desarrollo';

module.exports = function (req, res, next) {
    // 1. Leer el token del header (Formato: "Bearer <token>")
    // A veces llega como "x-auth-token" o en "Authorization"
    const authHeader = req.header('Authorization');

    // Si no hay header, denegamos acceso
    if (!authHeader) {
        return res.status(401).json({ msg: 'No hay token, permiso denegado' });
    }

    try {
        // Limpiamos el string "Bearer " si viene incluido
        const token = authHeader.replace('Bearer ', '');

        // 2. Verificar el token
        const decoded = jwt.verify(token, JWT_SECRET);

        // 3. Guardar el usuario en la petición (req)
        req.usuario = decoded.id;

        next(); // Continuar al controlador

    } catch (err) {
        res.status(401).json({ msg: 'Token no válido' });
    }
};