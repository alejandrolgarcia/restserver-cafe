const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');

const Producto = require('../models/producto');

const app = express();

// ============================
// Mostrar todos los productos
// ============================
app.get('/productos', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productos) => {
            // si error
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                });
            }
            // si Ok
            res.json({
                ok: true,
                productos,
            });
        });
});

// ============================
// Mostrar un producto por ID
// ============================
app.get('/productos/:id', (req, res) => {
    let id = req.params.id;

    Producto.findById(id)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productoDB) => {
            // Si error
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El ID de producto no existe'
                    }
                });
            }
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                });
            }
            // si Ok
            res.json({
                ok: true,
                productoDB,
            });
        });

});

// ============================
// Búsqueda de un producto
// ============================
app.get('/productos/buscar/:termino', (req, res) => {

    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                });
            }
            // si Ok
            res.json({
                ok: true,
                productoDB,
            });
        });

});

// ============================
// Crear nuevo producto
// ============================
app.post('/productos', verificaToken, (req, res) => {

    let body = req.body;

    let producto = new Producto({

        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        disponible: body.disponible,
        usuario: req.usuario._id

    });

    producto.save((err, productoDB) => {
        // Si error
        if (err) {
            return res.status(500).json({
                ok: false,
                err,
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }
        // Si es ok
        res.json({
            ok: true,
            producto: productoDB,
        });
    });
});

// ============================
// Actualizar por categorías
// ============================
app.put('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    let editarProducto = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        disponible: body.disponible
    }

    Producto.findByIdAndUpdate(id, editarProducto, { new: true, runValidators: true }, (err, productoDB) => {
        // si error
        if (err) {
            return res.status(500).json({
                ok: false,
                err,
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID del producto no existe'
                }
            });
        }
        // si OK
        res.json({
            ok: true,
            producto: productoDB,
        });
    });

});

// ============================
// Remover la categorías
// ============================
app.delete('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    let cambiarDisponible = {
        disponible: false,
    };

    Producto.findByIdAndUpdate(id, cambiarDisponible, { new: true }, (err, productoBorrado) => {
        // Si error
        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado',
                },
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                err,
            });
        }

        res.json({
            ok: true,
            producto: productoBorrado,
            message: 'Producto borrado'
        });
    });

});

module.exports = app;