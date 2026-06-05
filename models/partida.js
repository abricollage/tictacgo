const mongoose = require('mongoose');

module.exports = mongoose.model('Partida',{
    ganador:String,
    fecha:{type:Date,default:Date.now}
});