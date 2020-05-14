// Configuración global

// ==================
// Puerto
// ==================
process.env.PORT = process.env.PORT || 3000;

// ==================
// Entorno
// ==================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ==================
// Vencimiento del token
// ==================

process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

// ==================
// SEED de autenticación
// ==================

process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

// ==================
// Base de datos
// ==================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

// ==================
// Google Client ID
// ==================

process.env.CLIENT_ID = process.env.CLIENT_ID || '346564946929-n2b6cj72h0u6ou8rjn7475su45hcu1bo.apps.googleusercontent.com';