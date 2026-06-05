const tablero = document.getElementById('tablero');
const estado = document.getElementById('estado');
let celdas = ['', '', '', '', '', '', '', '', ''];
let turno = 'X';
let juegoActivo = true;

// ========================================================
// 🔊 MOTOR DE EFECTOS DE SONIDO RETRO (SINTETIZADOR ARCADE)
// ========================================================
function reproducirSonido(efecto) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscilador = audioCtx.createOscillator();
        const nodoVolumen = audioCtx.createGain();
        
        oscilador.connect(nodoVolumen);
        nodoVolumen.connect(audioCtx.destination);
        
        if (efecto === 'click') {
            // Un "pop" rápido cuando pones una X o una O
            oscilador.type = 'sine';
            oscilador.frequency.setValueAtTime(500, audioCtx.currentTime);
            oscilador.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.08);
            nodoVolumen.gain.setValueAtTime(0.2, audioCtx.currentTime);
            nodoVolumen.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.08);
            oscilador.start();
            oscilador.stop(audioCtx.currentTime + 0.08);
        } 
        else if (efecto === 'victoria') {
            // Fanfarria alegre de 8-bits (sube de tono)
            oscilador.type = 'square';
            oscilador.frequency.setValueAtTime(300, audioCtx.currentTime);
            oscilador.frequency.setValueAtTime(450, audioCtx.currentTime + 0.1);
            oscilador.frequency.setValueAtTime(600, audioCtx.currentTime + 0.2);
            nodoVolumen.gain.setValueAtTime(0.15, audioCtx.currentTime);
            nodoVolumen.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
            oscilador.start();
            oscilador.stop(audioCtx.currentTime + 0.4);
        } 
        else if (efecto === 'empate') {
            // Sonido grave hacia abajo (decepción)
            oscilador.type = 'triangle';
            oscilador.frequency.setValueAtTime(220, audioCtx.currentTime);
            oscilador.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.3);
            nodoVolumen.gain.setValueAtTime(0.25, audioCtx.currentTime);
            nodoVolumen.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
            oscilador.start();
            oscilador.stop(audioCtx.currentTime + 0.3);
        }
    } catch (e) {
        console.log("AudioContext bloqueado temporalmente:", e);
    }
}
// ========================================================

function crearTablero() {
    tablero.innerHTML = '<div id="lineaGanadora" class="linea-ganadora"></div>';
    celdas.forEach((celda, i) => {
        const div = document.createElement('div');
        div.classList.add('celda');
        if (celda !== '') {
            div.classList.add(celda.toLowerCase());
        }
        div.textContent = celda;
        div.onclick = () => jugar(i);
        tablero.appendChild(div);
    });
}

function jugar(i) {
    if (celdas[i] || !juegoActivo) return;

    celdas[i] = turno;
    const celdaDiv = tablero.children[i + 1]; 
    celdaDiv.textContent = turno;
    celdaDiv.classList.add(turno.toLowerCase());

    reproducirSonido('click'); // ◄--- SONIDO AL MARCAR CASILLA

    verificar();

    if (juegoActivo) {
        turno = turno === 'X' ? 'O' : 'X';
    }
}

function verificar() {
    const win = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (let c of win) {
        if (celdas[c[0]] && celdas[c[0]] === celdas[c[1]] && celdas[c[1]] === celdas[c[2]]) {
            estado.textContent = `¡Ganó ${celdas[c[0]]}! 🎉`;
            juegoActivo = false;
            trazarLinea(c);
            reproducirSonido('victoria'); // ◄--- SONIDO AL GANAR
            guardar(celdas[c[0]]);
            return;
        }
    }

    if (!celdas.includes('') && juegoActivo) {
        estado.textContent = '¡Es un empate!';
        juegoActivo = false;
        reproducirSonido('empate'); // ◄--- SONIDO AL EMPATAR
        guardar('Empate');
    }
}

function trazarLinea(combinacion) {
    const linea = document.getElementById('lineaGanadora');
    const posiciones = {
        '0,1,2': { top: '16%', left: '2%', width: '96%', transform: 'rotate(0deg)' },
        '3,4,5': { top: '50%', left: '2%', width: '96%', transform: 'rotate(0deg)' },
        '6,7,8': { top: '84%', left: '2%', width: '96%', transform: 'rotate(0deg)' },
        '0,3,6': { top: '2%', left: '16%', width: '96%', transform: 'rotate(90deg)' },
        '1,4,7': { top: '2%', left: '50%', width: '96%', transform: 'rotate(90deg)' },
        '2,5,8': { top: '2%', left: '84%', width: '96%', transform: 'rotate(90deg)' },
        '0,4,8': { top: '2%', left: '2%', width: '135%', transform: 'rotate(45deg)' },
        '2,4,6': { top: '2%', left: '98%', width: '135%', transform: 'rotate(135deg)' }
    };

    const config = posiciones[combinacion.join(',')];
    if (config && linea) {
        linea.style.display = 'block';
        linea.style.top = config.top;
        linea.style.left = config.left;
        linea.style.transform = config.transform;
        
        setTimeout(() => {
            linea.style.width = config.width;
        }, 50);
    }
}

function reiniciar() {
    celdas = ['', '', '', '', '', '', '', '', ''];
    turno = 'X';
    juegoActivo = true;
    estado.textContent = '';
    crearTablero();
}

async function guardar(ganador) {
    try {
        const res = await fetch('/tictactoe/guardar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ganador })
        });
        if (!res.ok) throw new Error('Error en el servidor');
        
        cargarHistorial();

        let xpRegalo = ganador === 'Empate' ? 20 : 45;

        fetch('/api/mascota/jugar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ experienciaGanada: xpRegalo })
        })
        .then(res => res.json())
        .then(data => {
            if (data.hongosGanados) {
                const modalPremio = document.createElement('div');
                modalPremio.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; justify-content:center; align-items:center; z-index:9999; font-family:'Poppins',sans-serif;";
                
                let tituloModal = ganador === 'Empate' ? '¡PARTIDA EMPATADA!' : `¡VICTORIA PARA ${ganador}!`;

                modalPremio.innerHTML = `
                    <div style="background:#1e1e2f; border:4px solid #ffeb3b; padding:40px; border-radius:20px; text-align:center; box-shadow:0 0 20px #ffeb3b; max-width:320px;">
                        <h2 style="color:#ffeb3b; margin:0 0 10px 0; font-size:1.6rem; font-family:'Fredoka One', cursive;">${tituloModal}</h2>
                        <p style="color:#fff; margin-bottom:15px;">Tu mascota se divirtió viendo la partida y recolectó:</p>
                        <div style="font-size:3.5rem; margin:20px 0; filter:drop-shadow(0 0 8px #ff416c);">🍄 x${data.hongosGanados}</div>
                        <button id="cerrarPremioBtn" style="background:#38ef7d; color:#000; border:none; padding:12px 25px; font-weight:bold; border-radius:10px; cursor:pointer; font-size:1rem; box-shadow:0 4px 0 #11998e;">¡Recoger Hongos!</button>
                    </div>
                `;
                document.body.appendChild(modalPremio);
                document.getElementById('cerrarPremioBtn').onclick = () => modalPremio.remove();
            }
        })
        .catch(err => console.error("Error al reclamar hongos en Tic Tac Toe:", err));

    } catch (error) {
        console.error('Error al guardar la partida:', error);
    }
}

async function cargarHistorial() {
    try {
        const res = await fetch('/tictactoe/historial');
        if (!res.ok) throw new Error('Error al obtener historial');
        const partidas = await res.json();
        
        let victoriasX = 0;
        let victoriasO = 0;
        let empates = 0;

        partidas.forEach(p => {
            if (p.ganador === 'X') victoriasX++;
            else if (p.ganador === 'O') victoriasO++;
            else if (p.ganador === 'Empate') empates++;
        });
        
        const historialUL = document.getElementById('historial');
        if (historialUL) {
            historialUL.innerHTML = `
                <li><strong>Jugador X:</strong> ${victoriasX} victorias</li>
                <li><strong>Jugador O:</strong> ${victoriasO} victorias</li>
                <li><strong>Empates:</strong> ${empates}</li>
            `;
        }
    } catch (error) {
        console.error('Error al cargar el historial:', error);
    }
}

async function borrarHistorial() {
    try {
        const res = await fetch('/tictactoe/historial', { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al borrar historial');
        cargarHistorial();
    } catch (error) {
        console.error('Error al eliminar el historial:', error);
    }
}

crearTablero();
cargarHistorial();