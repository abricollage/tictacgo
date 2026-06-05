const canvas = document.getElementById('tablero');
const ctx = canvas.getContext('2d');
const marcadorPuntos = document.getElementById('marcador-puntos');

const TAMANIO_CUADRO = 40;
const FILAS = 8;
const COLUMNAS = 8;

let tablero = [];
let puntos = 0;
let piezasDisponibles = [];
let indiceSeleccionado = -1;

// Definición de las piezas estilo Tetris
const PIEZAS = [
    { forma: [[1,1,1,1]], color: '#00ffff' }, // Palo horizontal
    { forma: [[1],[1],[1],[1]], color: '#00ffff' }, // Palo vertical
    { forma: [[1,1],[1,1]], color: '#ffff00' }, // Cuadrado
    { forma: [[0,1,0],[1,1,1]], color: '#9c27b0' }, // T horizontal
    { forma: [[1,0],[1,1],[1,0]], color: '#9c27b0' }, // T vertical
    { forma: [[1,0,0],[1,1,1]], color: '#ff9800' }, // L
    { forma: [[0,0,1],[1,1,1]], color: '#2196f3' }, // J
    { forma: [[1,1,0],[0,1,1]], color: '#4caf50' }, // Z
    { forma: [[0,1,1],[1,1,0]], color: '#f44336' }, // S
];

function iniciarTablero() {
    tablero = Array.from({ length: FILAS }, () => Array(COLUMNAS).fill(null));
}

function dibujarTablero() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar cuadrícula tenue
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    for(let i = 0; i <= COLUMNAS; i++) {
        ctx.beginPath(); ctx.moveTo(i * TAMANIO_CUADRO, 0); ctx.lineTo(i * TAMANIO_CUADRO, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * TAMANIO_CUADRO); ctx.lineTo(canvas.width, i * TAMANIO_CUADRO); ctx.stroke();
    }

    // Dibujar bloques colocados con estilo neón
    for (let f = 0; f < FILAS; f++) {
        for (let c = 0; c < COLUMNAS; c++) {
            if (tablero[f][c]) {
                ctx.fillStyle = tablero[f][c];
                ctx.shadowBlur = 10;
                ctx.shadowColor = tablero[f][c];
                ctx.fillRect(c * TAMANIO_CUADRO + 1, f * TAMANIO_CUADRO + 1, TAMANIO_CUADRO - 2, TAMANIO_CUADRO - 2);
                ctx.shadowBlur = 0; // Apagar sombra
            }
        }
    }
}

function generarNuevasPiezas() {
    piezasDisponibles = [];
    for (let i = 0; i < 3; i++) {
        const piezaAleatoria = PIEZAS[Math.floor(Math.random() * PIEZAS.length)];
        piezasDisponibles.push({ ...piezaAleatoria, usada: false });
    }
    dibujarPiezasOpciones();
}

function dibujarPiezasOpciones() {
    for (let i = 0; i < 3; i++) {
        const canvasP = document.getElementById(`pieza${i}`);
        const ctxP = canvasP.getContext('2d');
        ctxP.clearRect(0, 0, canvasP.width, canvasP.height);
        
        document.getElementById(`pieza${i}`).classList.remove('pieza-seleccionada');
        if (indiceSeleccionado === i) document.getElementById(`pieza${i}`).classList.add('pieza-seleccionada');

        if (piezasDisponibles[i].usada) continue;

        const pieza = piezasDisponibles[i];
        const tamCuadroP = 20;
        
        // Centrar la pieza en su canvas pequeño
        const offsetX = (canvasP.width - (pieza.forma[0].length * tamCuadroP)) / 2;
        const offsetY = (canvasP.height - (pieza.forma.length * tamCuadroP)) / 2;

        ctxP.fillStyle = pieza.color;
        for (let f = 0; f < pieza.forma.length; f++) {
            for (let c = 0; c < pieza.forma[f].length; c++) {
                if (pieza.forma[f][c]) {
                    ctxP.fillRect(offsetX + (c * tamCuadroP), offsetY + (f * tamCuadroP), tamCuadroP - 1, tamCuadroP - 1);
                }
            }
        }
    }
}

function seleccionarPieza(indice) {
    if (piezasDisponibles[indice].usada) return;
    indiceSeleccionado = indice;
    dibujarPiezasOpciones();
}

// Escuchar clics en el tablero principal para colocar la pieza seleccionada
canvas.addEventListener('click', (e) => {
    if (indiceSeleccionado === -1) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const col = Math.floor(x / TAMANIO_CUADRO);
    const fila = Math.floor(y / TAMANIO_CUADRO);
    
    intentarColocar(fila, col);
});

function intentarColocar(filaClick, colClick) {
    const pieza = piezasDisponibles[indiceSeleccionado];
    
    // Verificar si cabe
    let puedeColocar = true;
    for (let f = 0; f < pieza.forma.length; f++) {
        for (let c = 0; c < pieza.forma[f].length; c++) {
            if (pieza.forma[f][c]) {
                const filaTablero = filaClick + f;
                const colTablero = colClick + c;
                
                if (filaTablero >= FILAS || colTablero >= COLUMNAS || tablero[filaTablero][colTablero] !== null) {
                    puedeColocar = false;
                }
            }
        }
    }

    if (puedeColocar) {
        // Colocar la pieza
        for (let f = 0; f < pieza.forma.length; f++) {
            for (let c = 0; c < pieza.forma[f].length; c++) {
                if (pieza.forma[f][c]) {
                    tablero[filaClick + f][colClick + c] = pieza.color;
                }
            }
        }
        
        puntos += 10;
        piezasDisponibles[indiceSeleccionado].usada = true;
        indiceSeleccionado = -1;
        
        verificarLineas();
        dibujarTablero();
        
        // Si ya usamos las 3, generar más
        if (piezasDisponibles.every(p => p.usada)) {
            generarNuevasPiezas();
        } else {
            dibujarPiezasOpciones();
        }

        comprobarGameOver();
    }
}

function verificarLineas() {
    let filasBorradas = [];
    let columnasBorradas = [];

    // Revisar filas
    for (let f = 0; f < FILAS; f++) {
        if (tablero[f].every(celda => celda !== null)) filasBorradas.push(f);
    }

    // Revisar columnas
    for (let c = 0; c < COLUMNAS; c++) {
        let columnaLlena = true;
        for (let f = 0; f < FILAS; f++) {
            if (tablero[f][c] === null) columnaLlena = false;
        }
        if (columnaLlena) columnasBorradas.push(c);
    }

    // Borrar y puntuar
    filasBorradas.forEach(f => {
        for(let c=0; c<COLUMNAS; c++) tablero[f][c] = null;
    });
    
    columnasBorradas.forEach(c => {
        for(let f=0; f<FILAS; f++) tablero[f][c] = null;
    });

    const totalLineas = filasBorradas.length + columnasBorradas.length;
    if (totalLineas > 0) {
        // Da muchos más puntos si haces varias líneas a la vez (combo)
        puntos += (totalLineas * 100) * totalLineas; 
    }
    marcadorPuntos.innerText = puntos;
}

function comprobarGameOver() {
    let algunMovimientoPosible = false;

    piezasDisponibles.forEach((pieza) => {
        if (pieza.usada) return;

        for (let f = 0; f < FILAS; f++) {
            for (let c = 0; c < COLUMNAS; c++) {
                
                // Simular si cabe
                let cabe = true;
                for (let pf = 0; pf < pieza.forma.length; pf++) {
                    for (let pc = 0; pc < pieza.forma[pf].length; pc++) {
                        if (pieza.forma[pf][pc]) {
                            if (f + pf >= FILAS || c + pc >= COLUMNAS || tablero[f + pf][c + pc] !== null) {
                                cabe = false;
                            }
                        }
                    }
                }
                if (cabe) algunMovimientoPosible = true;
            }
        }
    });

    if (!algunMovimientoPosible && !piezasDisponibles.every(p => p.usada)) {
        setTimeout(() => {
            alert(`¡Juego Terminado! Conseguiste ${puntos} puntos.`);
            // Aquí puedes agregar tu código de fetch('/blockblast/guardar'...) si conectas la BD
        }, 100);
    }
}

function reiniciarJuego() {
    puntos = 0;
    marcadorPuntos.innerText = puntos;
    iniciarTablero();
    generarNuevasPiezas();
    dibujarTablero();
}

// Arrancar el juego por primera vez
reiniciarJuego();