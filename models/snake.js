const mongoose = require('mongoose');

module.exports = mongoose.model('Snake', {
    puntaje: { type: Number, required: true },
    fecha: { type: Date, default: Date.now }
});