const mongoose = require('mongoose');

module.exports = mongoose.model('Ahorcado', {
    nivelMaximo: { type: Number, default: 1 }
});