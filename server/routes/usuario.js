const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/usuario');
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

const app = express();

// GET
app.get('/usuario', verificaToken, (req, res) => {

    // return res.json({
    //     usuario: req.usuario,
    //     nombre: req.usuario.nombre,
    //     email: req.usuario.email
    // });

    // especificar limites de busqueda (paginación)
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            // Si error
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            // si OK
            Usuario.count({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    contar: conteo,
                });
            });
        });
});

// Post
app.post('/usuario', [verificaToken, verificaAdminRole], (req, res) => {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role,
    });

    // Grabar en mongo
    usuario.save((err, usuarioDB) => {
        // Si error
        if (err) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }

        // usuarioDB.password = null;

        // Si es ok
        res.json({
            ok: true,
            usuario: usuarioDB,
        });
    });
});

// Put
app.put('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']); // retorna solo los valores que queremos del objeto

    Usuario.findByIdAndUpdate(
        id,
        body, { new: true, runValidators: true },
        (err, usuarioDB) => {
            // Si error
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            res.json({
                ok: true,
                usuario: usuarioDB,
            });
        }
    );
});

// Delete
app.delete('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {
    let id = req.params.id;

    let cambiarEstado = {
        estado: false,
    };

    // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

    Usuario.findByIdAndUpdate(
        id,
        cambiarEstado, { new: true },
        (err, usuarioBorrado) => {
            // Si error
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            if (!usuarioBorrado) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Usuario no encontrado',
                    },
                });
            }

            res.json({
                ok: true,
                usuario: usuarioBorrado,
            });
        }
    );
});

module.exports = app;