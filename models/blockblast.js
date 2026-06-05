const mongoose = require('mongoose');

// Definimos qué datos vamos a guardar del Tetris
const blockblastSchema = new mongoose.Schema({
    puntaje: Number,
    lineas: Number,
    fecha: { type: Date, default: Date.now }
    // Puedes añadir el ID del usuario/mascota si lo usas en los otros juegos
});

// Al compilar este modelo, Mongoose buscará crear la colección "tetris" (o "tetrises" en plural)
const Blockblast = mongoose.model('Blockblast', blockblastSchema);