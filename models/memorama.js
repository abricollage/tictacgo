const mongoose = require('mongoose');

module.exports = mongoose.model('Memorama', {
    nivelMaximo: { type: Number, default: 1 }
});