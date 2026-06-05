// Variables de la lógica del juego
let canvas = null;
let ctx = null;

// Tablero de Tetris: 10 columnas x 20 filas
const COLUMNAS = 10;
const FILAS = 20;
let TAMANIO_CUADRO = 30; // Se ajustará al canvas
let tablero = [];

// Pieza actual en caída
let pieza = null;
let puntos = 0;
let lineas = 0;

// Lee el volumen global guardado en el navegador
let nivelVolumen = localStorage.getItem('global_volumen') ? parseFloat(localStorage.getItem('global_volumen')) : 0.5;
let volumenPrevio = nivelVolumen > 0 ? nivelVolumen : 0.5;

// Memoria persistente para el récord
let record = localStorage.getItem('tetris_record') ? parseInt(localStorage.getItem('tetris_record')) : 0;

let juegoLoopInterval = null;
let juegoTerminado = false;
let velocidadJuego = 500; // Caída cada 500ms

// Definición de las piezas (Tetrominós) y sus colores neón
const COLORES = [
    null,
    '#00ffff', // I - Cyan
    '#0000ff', // J - Azul
    '#ffa500', // L - Naranja
    '#ffff00', // O - Amarillo
    '#00ff00', // S - Verde
    '#800080', // T - Morado
    '#ff0000'  // Z - Rojo
];

const PIEZAS = [
    [],
    [[1, 1, 1, 1]], // I
    [[2, 0, 0], [2, 2, 2]], // J
    [[0, 0, 3], [3, 3, 3]], // L
    [[4, 4], [4, 4]], // O
    [[0, 5, 5], [5, 5, 0]], // S
    [[0, 6, 0], [6, 6, 6]], // T
    [[7, 7, 0], [0, 7, 7]]  // Z
];

let aplicacionIniciada = false;

function arrancarTodo() {
    if (aplicacionIniciada) return;
    aplicacionIniciada = true;
    
    actualizarCanvasActivo();
    configurarControles();
    iniciarJuego();
}

document.addEventListener("DOMContentLoaded", arrancarTodo);
if (document.readyState === "complete" || document.readyState === "interactive") {
    arrancarTodo();
}

function actualizarCanvasActivo() {
    canvas = document.querySelector('canvas') || document.getElementById('tetris-canvas');
    if (canvas) {
        ctx = canvas.getContext('2d');
        // Tetris tradicional es el doble de alto que de ancho
        if (!canvas.width) canvas.width = 300;
        if (!canvas.height) canvas.height = 600;
        TAMANIO_CUADRO = canvas.width / COLUMNAS;
    }
}

// --- LÓGICA DEL JUEGO ---
function crearMatriz(w, h) {
    const matriz = [];
    while (h--) {
        matriz.push(new Array(w).fill(0));
    }
    return matriz;
}

function generarPiezaRandom() {
    const tipo = PIEZAS[Math.floor(Math.random() * 7) + 1];
    return {
        matriz: tipo,
        pos: { x: Math.floor(COLUMNAS / 2) - Math.floor(tipo[0].length / 2), y: 0 }
    };
}

function iniciarJuego() {
    if (juegoLoopInterval) clearInterval(juegoLoopInterval);
    
    actualizarCanvasActivo();
    tablero = crearMatriz(COLUMNAS, FILAS);
    juegoTerminado = false;
    puntos = 0;
    lineas = 0;
    velocidadJuego = 500;
    
    record = parseInt(localStorage.getItem('tetris_record')) || 0;
    actualizarInterfazHTML();

    pieza = generarPiezaRandom();
    
    juegoLoopInterval = setInterval(caidaPieza, velocidadJuego);
    dibujarTodo();
}

function colision(tablero, pieza) {
    const m = pieza.matriz;
    const o = pieza.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (tablero[y + o.y] && tablero[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function fusionarPieza(tablero, pieza) {
    pieza.matriz.forEach((fila, y) => {
        fila.forEach((valor, x) => {
            if (valor !== 0) {
                tablero[y + pieza.pos.y][x + pieza.pos.x] = valor;
            }
        });
    });
}

function caidaPieza() {
    if (juegoTerminado) return;
    
    pieza.pos.y++;
    if (colision(tablero, pieza)) {
        pieza.pos.y--;
        fusionarPieza(tablero, pieza);
        reproducirSonido('colocar');
        limpiarLineas();
        pieza = generarPiezaRandom();
        
        // Game Over si la nueva pieza choca al nacer
        if (colision(tablero, pieza)) {
            finalizarJuego();
            return;
        }
    }
    dibujarTodo();
}

function limpiarLineas() {
    let lineasBorradas = 0;
    outer: for (let y = tablero.length - 1; y >= 0; --y) {
        for (let x = 0; x < tablero[y].length; ++x) {
            if (tablero[y][x] === 0) {
                continue outer;
            }
        }
        const filaVacia = tablero.splice(y, 1)[0].fill(0);
        tablero.unshift(filaVacia);
        ++y; // Volver a checar esta fila
        lineasBorradas++;
    }

    if (lineasBorradas > 0) {
        lineas += lineasBorradas;
        // Puntuación estilo arcade clásico
        const multiplicador = [0, 40, 100, 300, 1200]; 
        puntos += multiplicador[lineasBorradas];
        
        // Aumentar velocidad
        velocidadJuego = Math.max(100, 500 - (lineas * 10));
        clearInterval(juegoLoopInterval);
        juegoLoopInterval = setInterval(caidaPieza, velocidadJuego);

        if (puntos > record) {
            record = puntos;
            localStorage.setItem('tetris_record', record);
        }
        actualizarInterfazHTML();
        reproducirSonido('linea');
    }
}

function moverPieza(dir) {
    pieza.pos.x += dir;
    if (colision(tablero, pieza)) {
        pieza.pos.x -= dir;
    }
    dibujarTodo();
}

function rotarMatriz(matriz) {
    // Transponer y luego invertir fila
    const resultado = matriz[0].map((val, index) => matriz.map(row => row[index]).reverse());
    return resultado;
}

function rotarPieza() {
    const posInicial = pieza.pos.x;
    let offset = 1;
    pieza.matriz = rotarMatriz(pieza.matriz);
    
    // Evitar rotación fuera de muros
    while (colision(tablero, pieza)) {
        pieza.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > pieza.matriz[0].length) {
            pieza.matriz = rotarMatriz(rotarMatriz(rotarMatriz(pieza.matriz))); // Deshacer
            pieza.pos.x = posInicial;
            return;
        }
    }
    dibujarTodo();
    reproducirSonido('mover');
}

function dibujarMatriz(matriz, offset) {
    matriz.forEach((fila, y) => {
        fila.forEach((valor, x) => {
            if (valor !== 0) {
                ctx.fillStyle = COLORES[valor];
                
                // --- INICIO DE EFECTO NEÓN ---
                // Le decimos a JS que agregue un difuminado (glow) del mismo color que la pieza
                ctx.shadowBlur = 15;
                ctx.shadowColor = COLORES[valor];
                
                // Dibuja el cuadro principal
                ctx.fillRect((x + offset.x) * TAMANIO_CUADRO, (y + offset.y) * TAMANIO_CUADRO, TAMANIO_CUADRO - 1, TAMANIO_CUADRO - 1);
                
                // Apagamos la sombra para que no ensucie el resto del juego
                ctx.shadowBlur = 0;
                // --- FIN DEL EFECTO NEÓN ---

                // Efecto de brillo blanco en los bordes para hacerlo más retro
                ctx.strokeStyle = '#ffffff';
                ctx.globalAlpha = 0.5;
                ctx.strokeRect((x + offset.x) * TAMANIO_CUADRO, (y + offset.y) * TAMANIO_CUADRO, TAMANIO_CUADRO - 1, TAMANIO_CUADRO - 1);
                ctx.globalAlpha = 1.0;
            }
        });
    });
}

function dibujarTodo() {
    if (!canvas || !ctx) {
        actualizarCanvasActivo();
        if (!ctx) return;
    }
    
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    dibujarMatriz(tablero, { x: 0, y: 0 });
    dibujarMatriz(pieza.matriz, pieza.pos);

    if (juegoTerminado) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 32px "Press Start 2P", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 15);
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px "Press Start 2P", sans-serif';
        ctx.fillText(`Puntos: ${puntos}`, canvas.width / 2, canvas.height / 2 + 30);
    }
}

function finalizarJuego() {
    juegoTerminado = true;
    clearInterval(juegoLoopInterval);
    reproducirSonido('choque');
    dibujarTodo(); 

    if (puntos > 0) {
        fetch('/tetris/guardar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ puntaje: puntos, lineas: lineas, fecha: new Date() })
        }).catch(err => console.error('Error al guardar:', err));
    }

    // Calcula experiencia: base + bonus por puntos
    const xpGanada = 20 + Math.floor(puntos / 10);

    fetch('/api/mascota/jugar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experienciaGanada: xpGanada })
    })
    .then(res => res.json())
    .then(data => {
        if (data.hongosGanados) {
            const modalPremio = document.createElement('div');
            modalPremio.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; justify-content:center; align-items:center; z-index:9999; font-family:'Press Start 2P', sans-serif;";
            modalPremio.innerHTML = `
                <div style="background:#1e1e2f; border:4px solid #ffeb3b; padding:40px; border-radius:20px; text-align:center; box-shadow:0 0 20px #ffeb3b; max-width:320px;">
                    <h2 style="color:#ffeb3b; margin:0 0 15px 0; font-size:1.5rem;">¡GAME OVER!</h2>
                    <p style="color:#fff; font-size: 0.8rem; line-height:1.5; margin-bottom:15px;">Bloques eliminados y premio listo:</p>
                    <div style="font-size:3.5rem; margin:20px 0; filter:drop-shadow(0 0 8px #ff416c);">🍄 x${data.hongosGanados}</div>
                    <button id="cerrarPremioBtn" style="background:#38ef7d; color:#000; border:none; padding:15px; font-weight:bold; border-radius:10px; cursor:pointer; font-family:'Press Start 2P', sans-serif; font-size:0.8rem; box-shadow:0 4px 0 #11998e;">¡Recoger!</button>
                </div>
            `;
            document.body.appendChild(modalPremio);
            
            document.getElementById('cerrarPremioBtn').onclick = () => {
                modalPremio.remove();
                iniciarJuego(); 
            };
        }
    });
}

function actualizarInterfazHTML() {
    const elPuntos = document.getElementById('marcador-puntos');
    const elRecord = document.getElementById('marcador-record');
    const elLineas = document.getElementById('marcador-lineas');

    if (elPuntos) elPuntos.textContent = puntos;
    if (elRecord) elRecord.textContent = record;
    if (elLineas) elLineas.textContent = lineas;
}

function configurarControles() {
    window.addEventListener('keydown', (e) => {
        if (juegoTerminado) return;
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 's', 'a', 'd'].includes(e.key.toLowerCase())) {
            e.preventDefault();
        }

        switch (e.key) {
            case 'ArrowLeft': case 'a': case 'A':
                moverPieza(-1);
                reproducirSonido('mover');
                break;
            case 'ArrowRight': case 'd': case 'D':
                moverPieza(1);
                reproducirSonido('mover');
                break;
            case 'ArrowDown': case 's': case 'S':
                caidaPieza();
                break;
            case 'ArrowUp': case 'w': case 'W': case ' ':
                rotarPieza();
                break;
        }
    }, { passive: false });

    const btnReiniciar = document.querySelector('button');
    if (btnReiniciar && !btnReiniciar.textContent.includes('Recoger')) {
        btnReiniciar.onclick = (e) => {
            if(e.target.textContent.includes('Menú')) return;
            e.preventDefault();
            iniciarJuego();
            btnReiniciar.blur(); 
        };
    }
}

// Sintetizador Web Audio API para efectos de Tetris
function reproducirSonido(efecto) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const ganancia = audioCtx.createGain();
        osc.connect(ganancia); ganancia.connect(audioCtx.destination);
        
        let vol = nivelVolumen;

        if (efecto === 'mover') {
            osc.type = 'square'; osc.frequency.setValueAtTime(400, audioCtx.currentTime);
            ganancia.gain.setValueAtTime(0.05 * vol, audioCtx.currentTime);
            ganancia.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
            osc.start(); osc.stop(audioCtx.currentTime + 0.05);
        } else if (efecto === 'colocar') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(150, audioCtx.currentTime);
            ganancia.gain.setValueAtTime(0.1 * vol, audioCtx.currentTime);
            ganancia.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
            osc.start(); osc.stop(audioCtx.currentTime + 0.1);
        } else if (efecto === 'linea') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.2);
            ganancia.gain.setValueAtTime(0.15 * vol, audioCtx.currentTime);
            ganancia.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
            osc.start(); osc.stop(audioCtx.currentTime + 0.2);
        } else if (efecto === 'choque') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + 0.5);
            ganancia.gain.setValueAtTime(0.2 * vol, audioCtx.currentTime);
            ganancia.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
            osc.start(); osc.stop(audioCtx.currentTime + 0.5);
        }
    } catch (e) { console.log("Audio bloqueado"); }
}

// Función mágica para simular pulsaciones de teclado reales
function simularTeclaTetris(codigoTecla) {
    const evento = new KeyboardEvent('keydown', {
        key: codigoTecla,
        code: codigoTecla,
        bubbles: true,
        cancelable: true
    });
    window.dispatchEvent(evento);
}

// Conectar los botones táctiles con las teclas de PC
document.addEventListener("DOMContentLoaded", () => {
    const bLeft = document.getElementById('t-left');
    const bRight = document.getElementById('t-right');
    const bDown = document.getElementById('t-down');
    const bRotate = document.getElementById('t-rotate');

    if (bLeft) bLeft.addEventListener('click', () => simularTeclaTetris('ArrowLeft'));
    if (bRight) bRight.addEventListener('click', () => simularTeclaTetris('ArrowRight'));
    if (bDown) bDown.addEventListener('click', () => simularTeclaTetris('ArrowDown'));
    
    // 💡 Si tu Tetris rota con la tecla 'W', 'ArrowUp' o 'Space', cambia el texto de abajo:
    if (bRotate) bRotate.addEventListener('click', () => simularTeclaTetris('ArrowUp'));
});