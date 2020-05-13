const jwt = require('jsonwebtoken');

// ==================
// Verificar token
// ==================

let verificaToken = (req, res, next) => {

    // obtener el token que viene por el header
    let token = req.get('token');

    // validar si el token es correcto
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                },
            });
        }

        req.usuario = decoded.usuario;
        next();
    });

};

let verificaAdminRole = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.json({
            ok: false,
            err: {
                message: 'Requiere permiso de administrador',
            },
        });
    }

};

module.exports = {
    verificaToken,
    verificaAdminRole,
};