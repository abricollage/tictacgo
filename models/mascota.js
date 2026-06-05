const mongoose = require('mongoose');

const esquinaMascota = new mongoose.Schema({
    nombre: { type: String, default: 'Smurf Cat' },
    nivel: { type: Number, default: 1 },
    experiencia: { type: Number, default: 0 },
    hambre: { type: Number, default: 80 },
    diversion: { type: Number, default: 80 },
    energia: { type: Number, default: 100 },
    
    hongos: { type: Number, default: 20 }, 
    
    inventario: {
        baya: { type: Number, default: 0 },
        sopa: { type: Number, default: 0 },
        pizza: { type: Number, default: 0 },
        bebida: { type: Number, default: 0 }
    }, 
    
    ultimaActualizacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mascota', esquinaMascota);