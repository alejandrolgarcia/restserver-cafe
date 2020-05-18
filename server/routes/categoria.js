const express = require('express');

const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

const Categoria = require('../models/categoria');

const app = express();

// ============================
// Mostrar todas las categorías
// ============================
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion') // ordenar por x propiedad
        .populate('usuario', 'nombre email') // obtener detalle de usuario
        .exec((err, categorias) => {
            // Si error
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                });
            }

            res.json({
                ok: true,
                categorias
            });
        });
});

// ============================
// Mostrar una categoría por ID
// ============================
app.get('/categoria/:id', verificaToken, (req, res) => {
    // Categoria.findById(...);
    let id = req.params.id;
    Categoria.findById(id, '_id descripcion usuario')
        .exec((err, categoria) => {
            // Si error
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                });
            }

            res.json({
                ok: true,
                categoria
            });
        });
});

// ============================
// Crear nueva categoría
// ============================
app.post('/categoria', verificaToken, (req, res) => {
    // regresa la nueva categoria,
    // req.usuario._id

    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id,
    });

    // Graba en mongo
    categoria.save((err, categoriaDB) => {
        // Si error
        if (err) {
            return res.status(500).json({
                ok: false,
                err,
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }
        // Si es ok
        res.json({
            ok: true,
            categoria: categoriaDB,
        });
    });
});

// ============================
// Actualizar por categorías
// ============================
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    }

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err,
            });
        }

        if (err) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB,
        });

    });
});

// ============================
// Remover la categorías
// ============================
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => {
    // solo un administrador puede borrar categorias
    // Categoria.findByIdAndRemove
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }

        if (!categoriaBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada',
                },
            });
        }

        res.json({
            ok: true,
            categoria: categoriaBorrado,
        });
    });
});

module.exports = app;