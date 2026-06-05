const tablero = document.getElementById('tablero');
const textoNivel = document.getElementById('textoNivel');
const mensajeEstado = document.getElementById('mensajeEstado');
const btnSiguiente = document.getElementById('btnSiguiente');
const pantallaJuego = document.getElementById('pantallaJuego');
const pantallaNiveles = document.getElementById('pantallaNiveles');
const cuadriculaNiveles = document.getElementById('cuadriculaNiveles');

// 27 Emojis diferentes
const bancoEmojis = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄'];

let nivelActual = 1;
let nivelMaximoGlobal = 1;
let cartasVolteadas = [];
let parejasEncontradas = 0;
let totalParejas = 0;
let bloqueado = false;

// Iniciar aplicación
window.onload = async () => {
    await cargarProgreso();
    generarBotonesNiveles();
    iniciarNivel(nivelActual); 
};

// --- LOGICA DEL JUEGO ---

function calcularCartasPorNivel(nivel) {
    return 6 + Math.floor((nivel - 1) / 2) * 2;
}

function iniciarNivel(nivel) {
    nivelActual = nivel;
    textoNivel.textContent = `Nivel ${nivelActual}`;
    mensajeEstado.textContent = '';
    btnSiguiente.style.display = 'none';
    tablero.innerHTML = '';
    cartasVolteadas = [];
    parejasEncontradas = 0;
    bloqueado = false;

    const numCartas = calcularCartasPorNivel(nivelActual);
    totalParejas = numCartas / 2;

    const emojisNivel = bancoEmojis.slice(0, totalParejas);
    let baraja = [...emojisNivel, ...emojisNivel];
    baraja.sort(() => Math.random() - 0.5);

    if (numCartas <= 8) tablero.style.maxWidth = "350px";
    else if (numCartas <= 16) tablero.style.maxWidth = "450px";
    else tablero.style.maxWidth = "600px";

    baraja.forEach((emoji, index) => {
        const carta = document.createElement('div');
        carta.classList.add('carta');
        carta.dataset.emoji = emoji;
        carta.dataset.index = index;

        carta.innerHTML = `
            <div class="carta-inner">
                <div class="cara-frontal"></div>
                <div class="cara-trasera">${emoji}</div>
            </div>
        `;
        carta.onclick = () => voltearCarta(carta);
        tablero.appendChild(carta);
    });
}

function voltearCarta(carta) {
    if (bloqueado || carta.classList.contains('volteada') || carta.classList.contains('resuelta')) return;

    carta.classList.add('volteada');
    reproducirSonido('voltear'); // ◄--- ¡CONECTADO: SONIDO AL VOLTEAR CARTA!
    cartasVolteadas.push(carta);

    if (cartasVolteadas.length === 2) {
        verificarPareja();
    }
}

function verificarPareja() {
    bloqueado = true;
    const [carta1, carta2] = cartasVolteadas;

    if (carta1.dataset.emoji === carta2.dataset.emoji) {
        // Son pareja
        carta1.classList.replace('volteada', 'resuelta');
        carta2.classList.replace('volteada', 'resuelta');
        reproducirSonido('par'); // ◄--- ¡CONECTADO: SONIDO ENCONTRAR PAREJA!
        parejasEncontradas++;
        cartasVolteadas = [];
        bloqueado = false;

        if (parejasEncontradas === totalParejas) {
            finalizarNivel();
        }
    } else {
        // No son pareja
        reproducirSonido('incorrecto'); // ◄--- ¡CONECTADO: SONIDO DE FALLO!
        setTimeout(() => {
            carta1.classList.remove('volteada');
            carta2.classList.remove('volteada');
            cartasVolteadas = [];
            bloqueado = false;
        }, 800);
    }
}

async function finalizarNivel() {
    mensajeEstado.textContent = '¡Nivel Completado!';
    reproducirSonido('victoria'); // ◄--- ¡CONECTADO: SONIDO GANAR NIVEL!
    
    await guardarProgreso(nivelActual);
    
    fetch('/api/mascota/jugar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experienciaGanada: 50 }) 
    })
    .then(res => res.json())
    .then(data => {
        if (data.hongosGanados) {
            const modalPremio = document.createElement('div');
            modalPremio.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; justify-content:center; align-items:center; z-index:9999; font-family:'Poppins',sans-serif;";
            modalPremio.innerHTML = `
                <div style="background:#1e1e2f; border:4px solid #ffeb3b; padding:40px; border-radius:20px; text-align:center; box-shadow:0 0 20px #ffeb3b; max-width:320px;">
                    <h2 style="color:#ffeb3b; margin:0 0 10px 0; font-size:1.8rem; font-family:'Fredoka One', cursive;">¡NIVEL COMPLETADO!</h2>
                    <p style="color:#fff; margin-bottom:15px;">Le diste diversión al Gato Pitufo y recolectaste:</p>
                    <div style="font-size:3.5rem; margin:20px 0; filter:drop-shadow(0 0 8px #ff416c);">🍄 x${data.hongosGanados}</div>
                    <button id="cerrarPremioBtn" style="background:#38ef7d; color:#000; border:none; padding:12px 25px; font-weight:bold; border-radius:10px; cursor:pointer; font-size:1rem; box-shadow:0 4px 0 #11998e;">¡Recoger Hongos!</button>
                </div>
            `;
            document.body.appendChild(modalPremio);
            document.getElementById('cerrarPremioBtn').onclick = () => modalPremio.remove();
        }
    })
    .catch(err => console.error("Error al reclamar hongos en Memorama:", err));

    if (nivelActual < 50) {
        btnSiguiente.style.display = 'inline-block';
    } else {
        mensajeEstado.textContent = '¡HAS SUPERADO TODOS LOS NIVELES! 🏆';
    }
}

function cargarSiguienteNivel() {
    iniciarNivel(nivelActual + 1);
}

// --- SELECTOR DE NIVELES ---

function generarBotonesNiveles() {
    cuadriculaNiveles.innerHTML = '';
    for (let i = 1; i <= 50; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        if (i > nivelMaximoGlobal) {
            btn.disabled = true;
        } else {
            btn.onclick = () => {
                cerrarSelectorNiveles();
                iniciarNivel(i);
            };
        }
        cuadriculaNiveles.appendChild(btn);
    }
}

function abrirSelectorNiveles() {
    generarBotonesNiveles(); 
    pantallaJuego.style.display = 'none';
    pantallaNiveles.style.display = 'block';
}

function cerrarSelectorNiveles() {
    pantallaNiveles.style.display = 'none';
    pantallaJuego.style.display = 'block';
}

// --- PETICIONES AL SERVIDOR ---

async function cargarProgreso() {
    try {
        const res = await fetch('/memorama/progreso');
        if (!res.ok) throw new Error('Error API');
        const data = await res.json();
        nivelMaximoGlobal = data.nivelMaximo;
        nivelActual = nivelMaximoGlobal; 
    } catch (error) {
        console.error('Error cargando nivel:', error);
    }
}

async function guardarProgreso(nivelCompletado) {
    try {
        const res = await fetch('/memorama/completar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nivelSuperado: nivelCompletado })
        });
        if (!res.ok) throw new Error('Error API');
        const data = await res.json();
        
        if (data.nivelMaximo > nivelMaximoGlobal) {
            nivelMaximoGlobal = data.nivelMaximo;
        }
    } catch (error) {
        console.error('Error guardando nivel:', error);
    }
}

// ====== MOTOR DE EFECTOS DE SONIDO RETRO ======
function reproducirSonido(efecto) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscilador = audioCtx.createOscillator();
        const nodoVolumen = audioCtx.createGain();
        
        oscilador.connect(nodoVolumen);
        nodoVolumen.connect(audioCtx.destination);
        
        if (efecto === 'comer' || efecto === 'correcto') {
            oscilador.type = 'sine';
            oscilador.frequency.setValueAtTime(550, audioCtx.currentTime);
            oscilador.frequency.exponentialRampToValueAtTime(850, audioCtx.currentTime + 0.08);
            nodoVolumen.gain.setValueAtTime(0.15, audioCtx.currentTime);
            nodoVolumen.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.08);
            oscilador.start(); oscilador.stop(audioCtx.currentTime + 0.08);
        } 
        else if (efecto === 'voltear') {
            oscilador.type = 'triangle';
            oscilador.frequency.setValueAtTime(350, audioCtx.currentTime);
            nodoVolumen.gain.setValueAtTime(0.1, audioCtx.currentTime);
            nodoVolumen.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.05);
            oscilador.start(); oscilador.stop(audioCtx.currentTime + 0.05);
        }
        else if (efecto === 'par' || efecto === 'victoria') {
            oscilador.type = 'square';
            oscilador.frequency.setValueAtTime(400, audioCtx.currentTime);
            oscilador.frequency.setValueAtTime(550, audioCtx.currentTime + 0.08);
            oscilador.frequency.setValueAtTime(750, audioCtx.currentTime + 0.16);
            nodoVolumen.gain.setValueAtTime(0.1, audioCtx.currentTime);
            nodoVolumen.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.35);
            oscilador.start(); oscilador.stop(audioCtx.currentTime + 0.35);
        }
        else if (efecto === 'error' || efecto === 'incorrecto') {
            oscilador.type = 'sawtooth';
            oscilador.frequency.setValueAtTime(130, audioCtx.currentTime);
            nodoVolumen.gain.setValueAtTime(0.15, audioCtx.currentTime);
            nodoVolumen.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.15);
            oscilador.start(); oscilador.stop(audioCtx.currentTime + 0.15);
        }
        else if (efecto === 'choque' || efecto === 'perder') {
            oscilador.type = 'sawtooth';
            oscilador.frequency.setValueAtTime(180, audioCtx.currentTime);
            oscilador.frequency.linearRampToValueAtTime(60, audioCtx.currentTime + 0.4);
            nodoVolumen.gain.setValueAtTime(0.2, audioCtx.currentTime);
            nodoVolumen.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
            oscilador.start(); oscilador.stop(audioCtx.currentTime + 0.4);
        }
    } catch (e) {
        console.log("Audio bloqueado:", e);
    }
}