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


// --- LOGICA DEL JUEGO ---

function calcularCartasPorNivel(nivel) {
    return 6 + Math.floor((nivel - 1) / 2) * 2;
}

// Iniciar aplicación solo con memoria local
window.onload = function() {
    let maxNivelGuardado = sessionStorage.getItem('max_nivel_memorama');
    
    if (maxNivelGuardado) {
        nivelMaximoGlobal = parseInt(maxNivelGuardado);
        nivelActual = nivelMaximoGlobal;
    } else {
        nivelMaximoGlobal = 1;
        nivelActual = 1;
    }
    generarBotonesNiveles();
    iniciarNivel(nivelActual); 
};
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
    reproducirSonido('victoria'); 
    
    // --- AQUÍ GUARDAMOS EN LA MEMORIA A CORTO PLAZO ---
    if (nivelActual === nivelMaximoGlobal) {
        nivelMaximoGlobal++;
        sessionStorage.setItem('max_nivel_memorama', nivelMaximoGlobal);
    }

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