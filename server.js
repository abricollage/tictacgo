const express = require('express');
const path = require('path');
const app = express();

// Puerto para Render o para local
const PORT = process.env.PORT || 3000;

// Servir los archivos estáticos (HTML, CSS, JS)
app.use(express.static(__dirname));

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor Arcade corriendo perfectamente en el puerto ${PORT}`);
});