// Variables de la lógica del juego
let canvas = null;
let ctx = null;
let snake = [];
let direccion = { x: 0, y: 0 };
let proximaDireccion = { x: 0, y: 0 };
let comida = { x: 5, y: 5 };
let puntos = 0;

// Lee el volumen global guardado en el navegador, si no existe usa 0.5 (50%)
let nivelVolumen = localStorage.getItem('global_volumen') ? parseFloat(localStorage.getItem('global_volumen')) : 0.5;
let volumenPrevio = nivelVolumen > 0 ? nivelVolumen : 0.5;

// Memoria persistente para el récord
let record = localStorage.getItem('snake_record') ? parseInt(localStorage.getItem('snake_record')) : 0;

let juegoLoopInterval = null;
let juegoTerminado = false;

// Configuración del tamaño del Canvas
const TAMANIO_CUADRO = 20; 
let columnas = 20;
let filas = 20;
let velocidadJuego = 150; 

// Si jala o no jala?
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

// Buscar el canvas activo dinámicamente
function actualizarCanvasActivo() {
    canvas = document.querySelector('canvas') || document.getElementById('tablero') || document.getElementById('snake-canvas');
    if (canvas) {
        ctx = canvas.getContext('2d');
        if (!canvas.width) canvas.width = 400;
        if (!canvas.height) canvas.height = 400;
        columnas = canvas.width / TAMANIO_CUADRO;
        filas = canvas.height / TAMANIO_CUADRO;
    }
}

// --- LÓGICA DEL JUEGO ---
function iniciarJuego() {
    if (juegoLoopInterval) clearInterval(juegoLoopInterval);
    
    actualizarCanvasActivo();
    juegoTerminado = false;
    puntos = 0;
    
    // Recuperar el récord más fresco del navegador al comenzar
    record = parseInt(localStorage.getItem('snake_record')) || 0;
    
    actualizarInterfazHTML();

    // Iniciar con un solo cuadro
    snake = [{ x: 10, y: 10 }];
    direccion = { x: 0, y: 0 };
    proximaDireccion = { x: 0, y: 0 };

    generarComida();
    
    juegoLoopInterval = setInterval(actualizarJuego, velocidadJuego);
    dibujarTodo();
}

function generarComida() {
    while (true) {
        comida = {
            x: Math.floor(Math.random() * columnas),
            y: Math.floor(Math.random() * filas)
        };
        const encimaSnake = snake.some(seg => seg.x === comida.x && seg.y === comida.y);
        if (!encimaSnake) break;
    }
}

function actualizarJuego() {
    if (juegoTerminado) return;

    if (proximaDireccion.x === 0 && proximaDireccion.y === 0) {
        dibujarTodo();
        return;
    }

    direccion = proximaDireccion;
    
    const cabeza = {
        x: snake[0].x + direccion.x,
        y: snake[0].y + direccion.y
    };

    if (cabeza.x < 0 || cabeza.x >= columnas || cabeza.y < 0 || cabeza.y >= filas) {
        finalizarJuego();
        return;
    }

    const colisionCuerpo = snake.some(seg => seg.x === cabeza.x && seg.y === cabeza.y);
    if (colisionCuerpo) {
        finalizarJuego();
        return;
    }

    snake.unshift(cabeza);

    if (cabeza.x === comida.x && cabeza.y === comida.y) {
        puntos++;
        
        if (puntos > record) {
            record = puntos;
            localStorage.setItem('snake_record', record);
        }
        
        actualizarInterfazHTML();
        reproducirSonido('comer'); 
        generarComida();
    } else {
        snake.pop();
    }

    dibujarTodo();
}

function dibujarTodo() {
    if (!canvas || !ctx) {
        actualizarCanvasActivo();
        if (!ctx) return;
    }
    
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar Comida
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    let centroX = (comida.x * TAMANIO_CUADRO) + (TAMANIO_CUADRO / 2);
    let centroY = (comida.y * TAMANIO_CUADRO) + (TAMANIO_CUADRO / 2);
    ctx.arc(centroX, centroY, (TAMANIO_CUADRO / 2) - 2, 0, Math.PI * 2);
    ctx.fill();

    // Dibujar Serpiente
    snake.forEach((segmento, i) => {
        ctx.fillStyle = (i === 0) ? '#2ecc71' : '#27ae60'; 
        ctx.fillRect(
            segmento.x * TAMANIO_CUADRO + 1,
            segmento.y * TAMANIO_CUADRO + 1,
            TAMANIO_CUADRO - 2,
            TAMANIO_CUADRO - 2
        );
    });

    if (juegoTerminado) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 15);

        ctx.fillStyle = '#ffffff';
        ctx.font = '16px sans-serif';
        ctx.fillText(`Conseguiste: ${puntos} bolitas`, canvas.width / 2, canvas.height / 2 + 20);
    }
}

function finalizarJuego() {
    juegoTerminado = true;
    clearInterval(juegoLoopInterval);
    reproducirSonido('choque');
    dibujarTodo(); 

    if (puntos > 0) {
        fetch('/snake/guardar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                puntaje: puntos, 
                fecha: new Date()
            })
        })
        .then(res => res.json())
        .then(data => console.log('Puntaje de Snake guardado en el historial:', data))
        .catch(err => console.error('Error al guardar en el historial de Snake:', err));
    }

    fetch('/api/mascota/jugar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            experienciaGanada: 15 + (puntos * 5) 
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.hongosGanados) {

            const modalPremio = document.createElement('div');
            modalPremio.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; justify-content:center; align-items:center; z-index:9999; font-family:'Poppins',sans-serif;";
            modalPremio.innerHTML = `
                <div style="background:#1e1e2f; border:4px solid #ffeb3b; padding:40px; border-radius:20px; text-align:center; box-shadow:0 0 20px #ffeb3b; max-width:320px;">
                    <h2 style="color:#ffeb3b; margin:0 0 10px 0; font-size:1.8rem; font-family:'Fredoka One', cursive;">¡GAME OVER!</h2>
                    <p style="color:#fff; margin-bottom:15px;">Le diste diversión al Gato Pitufo, conseguiste ${puntos} bolitas y recolectaste:</p>
                    <div style="font-size:3.5rem; margin:20px 0; filter:drop-shadow(0 0 8px #ff416c);">🍄 x${data.hongosGanados}</div>
                    <button id="cerrarPremioBtn" style="background:#38ef7d; color:#000; border:none; padding:12px 25px; font-weight:bold; border-radius:10px; cursor:pointer; font-size:1rem; box-shadow:0 4px 0 #11998e;">¡Recoger Hongos!</button>
                </div>
            `;
            document.body.appendChild(modalPremio);
            
            // Acción al hacer clic en el botón verde
            document.getElementById('cerrarPremioBtn').onclick = () => {
                modalPremio.remove();
                // Reiniciar el tablero automáticamente al cerrar
                iniciarJuego(); 
            };
        }
    })
    .catch(error => {
        console.error('Error al dar recompensas a la mascota en Snake:', error);
    });
}

function actualizarInterfazHTML() {
    const elBolitas = document.getElementById('marcador-bolitas');
    const elRecord = document.getElementById('marcador-record');

    if (elBolitas) elBolitas.textContent = puntos;
    if (elRecord) elRecord.textContent = record;
}

function configurarControles() {
    window.addEventListener('keydown', (e) => {
        if (juegoTerminado) return;
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 's', 'a', 'd'].includes(e.key.toLowerCase())) {
            e.preventDefault();
        }

        switch (e.key) {
            case 'ArrowUp': case 'w': case 'W':
                if (direccion.y !== 1) proximaDireccion = { x: 0, y: -1 };
                break;
            case 'ArrowDown': case 's': case 'S':
                if (direccion.y !== -1) proximaDireccion = { x: 0, y: 1 };
                break;
            case 'ArrowLeft': case 'a': case 'A':
                if (direccion.x !== 1) proximaDireccion = { x: -1, y: 0 };
                break;
            case 'ArrowRight': case 'd': case 'D':
                if (direccion.x !== -1) proximaDireccion = { x: 1, y: 0 };
                break;
        }
    }, { passive: false });

    const selectorVelocidad = document.querySelector('select');
    if (selectorVelocidad) {
        selectorVelocidad.onchange = (e) => {
            const valor = e.target.value;
            if (valor.includes('Relajado')) velocidadJuego = 220;
            else if (valor.includes('Normal')) velocidadJuego = 150;
            else velocidadJuego = 90;
            
            if (!juegoTerminado && (direccion.x !== 0 || direccion.y !== 0)) {
                clearInterval(juegoLoopInterval);
                juegoLoopInterval = setInterval(actualizarJuego, velocidadJuego);
            }
        };
    }

    const btnReiniciar = document.querySelector('button');
    if (btnReiniciar) {
        btnReiniciar.onclick = (e) => {
            if(e.target.textContent.includes('Menú')) return;
            e.preventDefault();
            iniciarJuego();
            btnReiniciar.blur(); 
        };
    }

    const barraVolumen = document.getElementById('barra-volumen');
    const btnVolumen = document.getElementById('btn-volumen');

    if (barraVolumen && btnVolumen) {
        // Inicializa la barra con el valor global guardado en el navegador
        barraVolumen.value = nivelVolumen * 100;
        actualizarEmojiVolumen(barraVolumen.value);

        // Al deslizar la barra con el mouse
        barraVolumen.oninput = (e) => {
            const valor = e.target.value;
            nivelVolumen = valor / 100;
            localStorage.setItem('global_volumen', nivelVolumen); // Guarda el volumen para otros juegos
            actualizarEmojiVolumen(valor);
        };

        // Al hacer clic en el botón (mutear/desmutear)
        btnVolumen.onclick = (e) => {
            e.preventDefault();
            btnVolumen.blur(); // Quita el foco para que las flechas sigan moviendo a la serpiente

            if (nivelVolumen > 0) {
                volumenPrevio = nivelVolumen;
                nivelVolumen = 0;
            } else {
                nivelVolumen = volumenPrevio;
            }
            
            barraVolumen.value = nivelVolumen * 100;
            localStorage.setItem('global_volumen', nivelVolumen);
            actualizarEmojiVolumen(barraVolumen.value);
        };
    }

    function actualizarEmojiVolumen(valor) {
        if (!btnVolumen) return;
        if (valor == 0) btnVolumen.textContent = '❌';
        else if (valor < 40) btnVolumen.textContent = '🔈';
        else if (valor < 75) btnVolumen.textContent = '🔉';
        else btnVolumen.textContent = '🔊';
    }
}

function reproducirSonido(efecto) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscilador = audioCtx.createOscillator();
        const nodoVolumen = audioCtx.createGain();
        oscilador.connect(nodoVolumen); nodoVolumen.connect(audioCtx.destination);
        
        if (efecto === 'comer') {
            oscilador.type = 'sine'; oscilador.frequency.setValueAtTime(550, audioCtx.currentTime);
            oscilador.frequency.exponentialRampToValueAtTime(850, audioCtx.currentTime + 0.08);
            
            // ⚡ Ahora obedece a la barra multiplicando el volumen base
            nodoVolumen.gain.setValueAtTime(0.15 * nivelVolumen, audioCtx.currentTime);
            
            nodoVolumen.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.08);
            oscilador.start(); oscilador.stop(audioCtx.currentTime + 0.08);
        } else if (efecto === 'choque') {
            oscilador.type = 'sawtooth'; oscilador.frequency.setValueAtTime(180, audioCtx.currentTime);
            oscilador.frequency.linearRampToValueAtTime(60, audioCtx.currentTime + 0.4);
            
            // ⚡ Ahora obedece a la barra multiplicando el volumen base
            nodoVolumen.gain.setValueAtTime(0.2 * nivelVolumen, audioCtx.currentTime);
            
            nodoVolumen.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
            oscilador.start(); oscilador.stop(audioCtx.currentTime + 0.4);
        }
    } catch (e) { console.log("Audio bloqueado"); }
}