const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_desarrollo';

// =================================================================
// REGISTRAR USUARIO (CON AUDITORÍA DE SEGURIDAD)
// =================================================================
const registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).send('Faltan campos obligatorios.');
        }

        // --- 🛡️ SEGURIDAD: CAPTURA DE HUELLA DIGITAL ---
        // 1. Obtener IP (x-forwarded-for es por si usas un proxy/hosting, remoteAddress es local)
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '0.0.0.0';
        // Limpiar prefijo IPv6 de localhost (::ffff:)
        if (ip.includes('::ffff:')) { ip = ip.split(':').pop(); }

        // 2. Obtener Info del Dispositivo (Navegador, SO)
        const dispositivo = req.headers['user-agent'] || 'Desconocido';
        // ------------------------------------------------

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const nuevoUsuario = new Usuario({
            nombre,
            email,
            password: hashedPassword,
            // Guardamos la auditoría en el modelo
            metadata_registro: {
                ip: ip,
                dispositivo: dispositivo,
                navegador: dispositivo // Usamos el User-Agent como raw data
            }
        });

        await nuevoUsuario.save();
        res.status(201).send('Usuario registrado con éxito (y auditado).');

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).send('El email ya está registrado.');
        }
        console.error(error);
        res.status(500).send('Error interno del servidor.');
    }
};

// =================================================================
// LOGIN (Sin cambios mayores, solo logs de error mejorados)
// =================================================================
const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;
        const usuario = await Usuario.findOne({ email });

        if (!usuario) return res.status(400).send('Credenciales inválidas.');

        const isMatch = await bcrypt.compare(password, usuario.password);
        if (!isMatch) return res.status(400).send('Credenciales inválidas.');

        const token = jwt.sign(
            { id: usuario._id },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            token,
            id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email
        });

    } catch (error) {
        console.error("Error Login:", error);
        res.status(500).send('Error de autenticación.');
    }
};

// =================================================================
// OBTENER PERFIL (Datos completos del usuario logueado)
// =================================================================
const obtenerPerfil = async (req, res) => {
    try {
        // Buscamos al usuario por el ID del token (req.usuario)
        // .select('-password') sirve para NO enviar la contraseña al frontend
        const usuario = await Usuario.findById(req.usuario).select('-password');

        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        res.json(usuario);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

// =================================================================
// ACTUALIZAR PERFIL (Llenar los campos vacíos)
// =================================================================
const actualizarPerfil = async (req, res) => {
    try {
        // Extraemos todo lo que el usuario envíe en el body
        const {
            titular, resumen, ubicacion, habilidades,
            intereses, estado_busqueda, enlaces
        } = req.body;

        // Creamos un objeto con los campos que vamos a actualizar
        const perfilFields = {};
        if (titular) perfilFields.titular = titular;
        if (resumen) perfilFields.resumen = resumen;
        if (estado_busqueda) perfilFields.estado_busqueda = estado_busqueda;

        // Objetos anidados o Arrays
        if (ubicacion) perfilFields.ubicacion = ubicacion;
        if (habilidades) perfilFields.habilidades = habilidades; // Espera un array
        if (intereses) perfilFields.intereses = intereses;       // Espera un array

        // Actualizamos en la BD
        // { new: true } hace que nos devuelva el usuario YA actualizado
        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            req.usuario,
            { $set: perfilFields },
            { new: true }
        ).select('-password');

        res.json(usuarioActualizado);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error al actualizar perfil');
    }
};

// =================================================================
// ELIMINAR USUARIO
// =================================================================
const eliminarUsuario = async (req, res) => {
    try {
        const usuarioEliminado = await Usuario.findByIdAndDelete(req.usuario);
        if (!usuarioEliminado) return res.status(404).json({ msg: 'Usuario no encontrado' });
        res.json({ msg: 'Cuenta eliminada correctamente' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

module.exports = {
    registrarUsuario, loginUsuario, eliminarUsuario,
    obtenerPerfil,     // <--- Nuevo
    actualizarPerfil   // <--- Nuevo
}