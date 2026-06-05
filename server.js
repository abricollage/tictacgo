const express = require('express');
const mongoose = require('mongoose');
const Partida = require('./models/partida'); 
const Snake = require('./models/snake');
const Memorama = require('./models/memorama');
const Ahorcado = require('./models/ahorcado');
const Mascota = require('./models/mascota');

const app = express();

app.use(express.json());
app.use(express.static('public'));

// La conexión ahora intentará usar internet, y si no, usará la local
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://abricollagedbbb:4.1aKera_ars@hhh.i03jgpn.mongodb.net/tictacgo?appName=hhh';

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB conectado a la nube'))
    .catch((error) => console.error('Error crítico al conectar a MongoDB:', error));
    
// Endpoint: Guardar una partida
app.post('/tictactoe/guardar', async (req, res) => {
    try {
        const partida = new Partida(req.body);
        await partida.save();
        res.json({ ok: true });
    } catch (error) {
        console.error('Error al guardar la partida:', error);
        res.status(500).json({ ok: false, error: 'Error interno del servidor al guardar' });
    }
});

// Endpoint: Obtener el historial de partidas
app.get('/tictactoe/historial', async (req, res) => {
    try {
        const partidas = await Partida.find().sort({ fecha: -1 });
        res.json(partidas);
    } catch (error) {
        console.error('Error al obtener el historial:', error);
        res.status(500).json({ error: 'Error interno del servidor al leer el historial' });
    }
});

// Endpoint: Vaciar el historial de partidas
app.delete('/tictactoe/historial', async (req, res) => {
    try {
        await Partida.deleteMany({});
        res.json({ ok: true });
    } catch (error) {
        console.error('Error al eliminar el historial:', error);
        res.status(500).json({ ok: false, error: 'Error interno del servidor al borrar' });
    }
});

app.post('/snake/guardar', async (req, res) => {
    try {
        const nuevaPartida = new Snake(req.body);
        await nuevaPartida.save();
        res.json({ ok: true });
    } catch (error) {
        console.error('Error al guardar record de Snake:', error);
        res.status(500).json({ ok: false, error: 'Error al guardar la puntuación' });
    }
});

app.get('/snake/record', async (req, res) => {
    try {
        // Buscamos el puntaje más alto
        const mejorPartida = await Snake.findOne().sort({ puntaje: -1 });
        res.json({ record: mejorPartida ? mejorPartida.puntaje : 0 });
    } catch (error) {
        console.error('Error al obtener el récord de Snake:', error);
        res.status(500).json({ error: 'Error al leer el récord' });
    }
});



const tetrisSchema = new mongoose.Schema({
    puntaje: Number,
    lineas: Number,
    fecha: { type: Date, default: Date.now }
});

const Tetris = mongoose.model('Tetris', tetrisSchema);
app.post('/tetris/guardar', async (req, res) => {
    try {
        const { puntaje, lineas } = req.body;
        
        // Creamos el nuevo registro
        const nuevaPartida = new Tetris({
            puntaje: puntaje,
            lineas: lineas
        });

        await nuevaPartida.save(); 

        res.status(200).json({ mensaje: "Puntuación de Tetris guardada en la base de datos" });
    } catch (error) {
        console.error("Error al guardar Tetris:", error);
        res.status(500).json({ error: "No se pudo guardar la partida" });
    }
});

const blockblastSchema = new mongoose.Schema({
    puntaje: Number,
    lineas: Number,
    fecha: { type: Date, default: Date.now }
});

const Blockblast = mongoose.model('Blockblast', blockblastSchema);
app.post('/blockblast/guardar', async (req, res) => {
    try {
        const { puntaje, lineas } = req.body;
        
        // Creamos el nuevo registro
        const nuevaPartida = new Blockblast({
            puntaje: puntaje,
            lineas: lineas
        });

        await nuevaPartida.save(); 

        res.status(200).json({ mensaje: "Puntuación de Blockblast guardada en la base de datos" });
    } catch (error) {
        console.error("Error al guardar Blockblast:", error);
        res.status(500).json({ error: "No se pudo guardar la partida" });
    }
});

// --- ENDPOINTS MEMORAMA ---
app.get('/memorama/progreso', async (req, res) => {
    try {
        let progreso = await Memorama.findOne();
        if (!progreso) progreso = await Memorama.create({ nivelMaximo: 1 });
        res.json({ nivelMaximo: progreso.nivelMaximo });
    } catch (error) {
        console.error('Error al obtener progreso de Memorama:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

app.post('/memorama/completar', async (req, res) => {
    try {
        const { nivelSuperado } = req.body;
        let progreso = await Memorama.findOne();
        if (!progreso) progreso = await Memorama.create({ nivelMaximo: 1 });

        // Si superaste tu récord y aún no pasas del 50, se desbloquea el siguiente
        if (nivelSuperado === progreso.nivelMaximo && progreso.nivelMaximo < 50) {
            progreso.nivelMaximo += 1;
            await progreso.save();
        }
        res.json({ nivelMaximo: progreso.nivelMaximo });
    } catch (error) {
        console.error('Error al guardar progreso de Memorama:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});
// --- AHORCADO ---
app.get('/ahorcado/progreso', async (req, res) => {
    try {
        let progreso = await Ahorcado.findOne();
        if (!progreso) progreso = await Ahorcado.create({ nivelMaximo: 1 });
        res.json({ nivelMaximo: progreso.nivelMaximo });
    } catch (error) {
        console.error('Error al obtener progreso de Ahorcado:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

app.post('/ahorcado/completar', async (req, res) => {
    try {
        const { nivelSuperado } = req.body;
        let progreso = await Ahorcado.findOne();
        if (!progreso) progreso = await Ahorcado.create({ nivelMaximo: 1 });

        // Solo aumentamos el límite si pasaste tu nivel máximo
        if (nivelSuperado === progreso.nivelMaximo && progreso.nivelMaximo < 50) {
            progreso.nivelMaximo += 1;
            await progreso.save();
        }
        res.json({ nivelMaximo: progreso.nivelMaximo });
    } catch (error) {
        console.error('Error al guardar progreso de Ahorcado:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});
// 1. Obtener estado de la mascota
app.get('/api/mascota', async (req, res) => {
    try {
        let mascota = await Mascota.findOne();
        if (!mascota) mascota = await Mascota.create({ nombre: 'Smurf Cat' });
        res.json(mascota);
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// 2. ¡REFORMADO!: Jugar en minijuegos otorga Hongos 🍄 y controla el Nivel
app.post('/api/mascota/jugar', async (req, res) => {
    try {
        const { experienciaGanada } = req.body;
        let mascota = await Mascota.findOne();
        if (!mascota) return res.status(404).json({ error: 'Mascota no encontrada' });

        // Regala entre 10 y 25 hongos aleatorios por ganar/completar un nivel
        const hongosGanados = Math.floor(Math.random() * 16) + 10; 
        mascota.hongos += hongosGanados;

        // Actualizar estados comunes
        mascota.diversion = Math.min(100, mascota.diversion + 35);
        mascota.hambre = Math.max(0, mascota.hambre - 12);
        mascota.energia = Math.max(0, mascota.energia - 10);
        mascota.experiencia += experienciaGanada || 40;

        // Sistema automático de Subida de Nivel (Cada 100 * nivel subir)
        let limiteXp = mascota.nivel * 100;
        if (mascota.experiencia >= limiteXp) {
            mascota.experiencia -= limiteXp;
            mascota.nivel += 1;
        }

        await mascota.save();
        // Devolvemos el estado de la mascota Y de forma explícita los hongos ganados
        res.json({ mascota, hongosGanados });
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar recompensa' });
    }
});

// --- NUEVO ENDPOINT: Comprar alimento y guardarlo en la mochila ---
app.post('/api/mascota/comprar', async (req, res) => {
    try {
        const { alimento } = req.body; // 'baya', 'sopa', 'pizza' o 'bebida'
        let mascota = await Mascota.findOne();
        if (!mascota) return res.status(404).json({ error: 'Mascota no encontrada' });

        let costo = 0;
        if (alimento === 'baya') costo = 5;
        else if (alimento === 'sopa') costo = 12;
        else if (alimento === 'pizza') costo = 25;
        else if (alimento === 'bebida') costo = 20;
        else { return res.status(400).json({ error: 'Ítem inválido' }); }

        // Verificar si le alcanza
        if (mascota.hongos < costo) {
            return res.status(400).json({ error: '¡No tienes suficientes hongos! 🍄' });
        }

        // Cobrar los hongos
        mascota.hongos -= costo;
        
        // Asegurar que el objeto inventario exista
        if (!mascota.inventario) {
            mascota.inventario = { baya: 0, sopa: 0, pizza: 0, bebida: 0 };
        }

        // Sumar 1 a la mochila en MongoDB
        mascota.inventario[alimento] = (mascota.inventario[alimento] || 0) + 1;

        await mascota.save();
        res.json({ success: true, mascota });
    } catch (error) {
        console.error("Error al comprar:", error);
        res.status(500).json({ error: 'Error en la compra' });
    }
});

// --- ENDPOINT REFORMADO: Alimentar a la mascota usando el inventario ---
app.post('/api/mascota/alimentar', async (req, res) => {
    try {
        const { alimento } = req.body;
        let mascota = await Mascota.findOne();
        if (!mascota) return res.status(404).json({ error: 'Mascota no encontrada' });

        // Verificar si tiene el alimento en la mochila
        if (!mascota.inventario || !mascota.inventario[alimento] || mascota.inventario[alimento] <= 0) {
            return res.status(400).json({ error: '¡No tienes este ítem en tu mochila! 🎒' });
        }

        let nutricion = 0;
        let energiaRecuperada = 0;
        let costoOriginal = 0;

        if (alimento === 'baya') { nutricion = 15; costoOriginal = 5; }
        else if (alimento === 'sopa') { nutricion = 40; costoOriginal = 12; }
        else if (alimento === 'pizza') { nutricion = 85; costoOriginal = 25; }
        else if (alimento === 'bebida') { energiaRecuperada = 30; costoOriginal = 20; }

        // Restar 1 de la mochila en MongoDB
        mascota.inventario[alimento] -= 1;

        // Modificado a Math.min(200, ...) para permitir que el hambre llegue al 200%
        if (nutricion > 0) {
            mascota.hambre = Math.min(200, mascota.hambre + nutricion);
        }
        if (energiaRecuperada > 0) {
            mascota.energia = Math.min(100, mascota.energia + energiaRecuperada);
        }
        
        // Otorgar la experiencia por comer
        mascota.experiencia += Math.floor(costoOriginal * 0.5);

        // Control automático de Subida de Nivel al comer
        let limiteXp = mascota.nivel * 100;
        if (mascota.experiencia >= limiteXp) {
            mascota.experiencia -= limiteXp;
            mascota.nivel += 1;
        }

        await mascota.save();
        res.json({ success: true, mascota });
    } catch (error) {
        console.error("Error al alimentar:", error);
        res.status(500).json({ error: 'Error al alimentar' });
    }
});
// Inicio del servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor listo y corriendo en el puerto ${PORT}`);
});