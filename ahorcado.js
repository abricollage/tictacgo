const canvas = document.getElementById('canvasAhorcado');
const ctx = canvas.getContext('2d');
const txtPalabra = document.getElementById('palabraOculta');
const tecladoDiv = document.getElementById('teclado');
const textoNivel = document.getElementById('textoNivel');
const mensajeEstado = document.getElementById('mensajeEstado');
const btnSiguiente = document.getElementById('btnSiguiente');
const btnReintentar = document.getElementById('btnReintentar');
const pantallaJuego = document.getElementById('pantallaJuego');
const pantallaNiveles = document.getElementById('pantallaNiveles');
const cuadriculaNiveles = document.getElementById('cuadriculaNiveles');
const btnPista = document.getElementById('btnPista');
const modalPista = document.getElementById('modalPista');
const textoPista = document.getElementById('textoPista');

let nivelActual = 1;
let nivelMaximoGlobal = 1;
let palabraSecreta = "";
let pistaActual = "";
let letrasAdivinadas = [];
let errores = 0;
const maxErrores = 6;
let juegoBloqueado = false;

// --- Datillos---
const bancoPreguntas = {
    1: [{p: "SOL", h: "Estrella gigante en nuestro sistema"}, {p: "PAN", h: "Se come en el desayuno o con café"}],
    2: [{p: "MAR", h: "Gran masa de agua salada"}, {p: "LUZ", h: "Lo contrario a la oscuridad"}],
    3: [{p: "PEZ", h: "Animal acuático con escamas"}, {p: "BUS", h: "Transporte público grande"}],
    4: [{p: "GOL", h: "Máxima emoción en el fútbol"}, {p: "UNO", h: "El primer número natural"}],
    5: [{p: "VIA", h: "Camino por donde pasa el tren"}],
    6: [{p: "GATO", h: "Mascota que maúlla"}, {p: "CASA", h: "Lugar donde vives"}],
    7: [{p: "LUNA", h: "Satélite natural de la Tierra"}, {p: "ROSA", h: "Flor con espinas"}],
    8: [{p: "LEÓN", h: "El rey de la selva"}, {p: "TREN", h: "Vehículo que va sobre rieles"}],
    9: [{p: "AZUL", h: "El color del cielo despejado"}, {p: "PAPA", h: "Tubérculo para hacer papas fritas"}],
    10: [{p: "NUBE", h: "Masa blanca de agua en el cielo"}],
    11: [{p: "PERRO", h: "El mejor amigo del hombre"}],
    12: [{p: "ARBOL", h: "Planta grande con tronco y hojas"}],
    13: [{p: "FUEGO", h: "Quema y produce calor"}],
    14: [{p: "LLAVE", h: "Sirve para abrir cerraduras"}],
    15: [{p: "RATON", h: "Roedor pequeño o dispositivo de PC"}],
    16: [{p: "BOSQUE", h: "Lugar lleno de árboles densos"}],
    17: [{p: "CIUDAD", h: "Lugar urbanizado con muchos edificios"}],
    18: [{p: "TIEMPO", h: "Se mide con el reloj"}],
    19: [{p: "PIEDRA", h: "Materia mineral dura y sólida"}],
    20: [{p: "CAMINO", h: "Franja de tierra para transitar"}],
    21: [{p: "PLANETA", h: "Cuerpo celeste como la Tierra"}],
    22: [{p: "GUITARRA", h: "Instrumento musical de 6 cuerdas"}],
    23: [{p: "COMPUTADORA", h: "Máquina electrónica para procesar datos"}],
    24: [{p: "DINOSAURIO", h: "Reptil gigante extinto"}],
    25: [{p: "CHOCOLATE", h: "Dulce delicioso hecho de cacao"}],
    26: [{p: "UNIVERSO", h: "Todo el espacio y el tiempo existentes"}],
    27: [{p: "MONTAÑA", h: "Gran elevación natural del terreno"}],
    28: [{p: "AVENTURA", h: "Suceso emocionante y arriesgado"}],
    29: [{p: "TORMENTA", h: "Fenómeno con lluvia, truenos y rayos"}],
    30: [{p: "BIBLIOTECA", h: "Lugar lleno de libros para leer"}],
    31: [{p: "BUENOS DIAS", h: "Saludo cordial por las mañanas"}],
    32: [{p: "HOLA MUNDO", h: "La primera frase de todo programador"}],
    33: [{p: "EL SOL BRILLA", h: "Descripción de un día muy despejado"}],
    34: [{p: "HACE CALOR", h: "Lo que dices en pleno verano"}],
    35: [{p: "FELIZ CUMPLEAÑOS", h: "Felicitación en tu día especial"}],
    36: [{p: "TIERRA A LA VISTA", h: "Grito famoso de los marineros y piratas"}],
    37: [{p: "EL TIEMPO VUELA", h: "Frase sobre lo rápido que pasa la vida"}],
    38: [{p: "AGUA QUE NO HAS DE BEBER", h: "Dicho popular: ...déjala correr"}],
    39: [{p: "OJO POR OJO", h: "Frase antigua sobre la venganza (...diente por diente)"}],
    40: [{p: "EL SABER NO OCUPA LUGAR", h: "Refrán sobre la importancia de aprender"}],
    41: [{p: "SABE MAS EL DIABLO POR VIEJO", h: "Refrán sobre el valor de la experiencia"}],
    42: [{p: "MAS VALE TARDE QUE NUNCA", h: "Dicho cuando llegas retrasado pero cumples"}],
    43: [{p: "AL PAN PAN Y AL VINO VINO", h: "Frase que significa decir las cosas claras"}],
    44: [{p: "A CABALLO REGALADO NO SE LE MIRA EL DIENTE", h: "Refrán sobre aceptar obsequios sin criticar"}],
    45: [{p: "CRUZAR EL CHARCO", h: "Expresión común para viajar a otro continente"}],
    46: [{p: "CAMARON QUE SE DUERME SE LO LLEVA LA CORRIENTE", h: "Refrán sobre la flojera o distracción"}],
    47: [{p: "DE TAL PALO TAL ASTILLA", h: "Frase sobre el parecido entre padres e hijos"}],
    48: [{p: "EN BOCA CERRADA NO ENTRAN MOSCAS", h: "Dicho sobre la prudencia al hablar"}],
    49: [{p: "PERRO QUE LADRA NO MUERDE", h: "Frase sobre personas que amenazan mucho pero no actúan"}],
    50: [{p: "DORMIR COMO UN TRONCO", h: "Expresión para referirse a un sueño muy profundo"}]
};

const alfabeto = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split('');


window.onload = function() {
    let maxNivelGuardado = sessionStorage.getItem('max_nivel_ahorcado');
    
    if (maxNivelGuardado) {
        nivelMaximoGlobal = parseInt(maxNivelGuardado);
        nivelActual = nivelMaximoGlobal;
        console.log("Progreso recuperado temporalmente: Nivel " + nivelActual);
    } else {
        nivelMaximoGlobal = 1;
        nivelActual = 1;
    }
    iniciarNivel(nivelActual); 
};

function iniciarNivel(nivel) {
    nivelActual = nivel;
    textoNivel.textContent = `Nivel ${nivelActual}`;
    mensajeEstado.textContent = '';
    btnSiguiente.style.display = 'none';
    btnReintentar.style.display = 'none';
    btnPista.style.display = 'flex'; 
btnPista.disabled = false;   
    juegoBloqueado = false;
    errores = 0;
    letrasAdivinadas = [];

    const opcionesNivel = bancoPreguntas[nivelActual] || bancoPreguntas[1];
    const seleccion = opcionesNivel[Math.floor(Math.random() * opcionesNivel.length)];
    
    palabraSecreta = seleccion.p;
    pistaActual = seleccion.h;

    dibujarAhorcado();
    actualizarPalabraOculta();
    generarTeclado();
}

function generarTeclado() {
    tecladoDiv.innerHTML = '';
    alfabeto.forEach(letra => {
        const btn = document.createElement('button');
        btn.classList.add('tecla'); 
        btn.textContent = letra;
        btn.onclick = () => procesarLetra(letra, btn);
        tecladoDiv.appendChild(btn);
    });
}

function actualizarPalabraOculta() {
    txtPalabra.innerHTML = ''; 
    let ganaste = true;

    const palabras = palabraSecreta.split(' ');

    palabras.forEach(palabra => {
        const cajaPalabra = document.createElement('span');
        cajaPalabra.className = 'bloque-palabra';

        for (let letra of palabra) {
            const spanLetra = document.createElement('span');
            spanLetra.className = 'letra-ahorcado'; 
            
            if (letrasAdivinadas.includes(letra)) {
                spanLetra.textContent = letra;
            } else {
                spanLetra.textContent = '_';
                ganaste = false; 
            }
            cajaPalabra.appendChild(spanLetra);
        }
        
        txtPalabra.appendChild(cajaPalabra);
    });

    if (ganaste) {
        finalizarNivel(true);
    }
}

function procesarLetra(letra, boton) {
    if (juegoBloqueado) return;

    boton.disabled = true;
    letrasAdivinadas.push(letra);

    if (palabraSecreta.includes(letra)) {
        boton.classList.add('correcta');
        reproducirSonido('correcto'); // ◄--- ¡CONECTADO: SONIDO LETRA CORRECTA!
        actualizarPalabraOculta();
    } else {
        boton.classList.add('incorrecta');
        reproducirSonido('incorrecto'); // ◄--- ¡CONECTADO: SONIDO LETRA INCORRECTA!
        errores++;
        dibujarAhorcado();
        
        if (errores === 1) {
            btnPista.style.display = 'flex';
        }
        
        const contenedor = document.querySelector('.container');
        if (contenedor) {
            contenedor.classList.add('shake');
            setTimeout(() => contenedor.classList.remove('shake'), 300);
        }

        if (errores >= maxErrores) {
            finalizarNivel(false);
        }
    }
}

function revelarLetra() {
    if (juegoBloqueado) return;
    let letrasFaltantes = [];
    for (let letra of palabraSecreta) {
        if (letra !== " " && !letrasAdivinadas.includes(letra)) {
            if (!letrasFaltantes.includes(letra)) {
                letrasFaltantes.push(letra);
            }
        }
    }

    if (letrasFaltantes.length === 0) return;

    const letraAleatoria = letrasFaltantes[Math.floor(Math.random() * letrasFaltantes.length)];

    const botonesTeclado = tecladoDiv.querySelectorAll('.tecla');
    let botonLetraHTML = null;
    
    botonesTeclado.forEach(btn => {
        if (btn.textContent === letraAleatoria) {
            botonLetraHTML = btn;
        }
    });

    if (botonLetraHTML) {
        procesarLetra(letraAleatoria, botonLetraHTML);
    }

    btnPista.disabled = true; 
}

function dibujarAhorcado() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    let colorMonito = '#8543ff'; 
    if (errores >= maxErrores) colorMonito = '#ff416c'; 

    ctx.strokeStyle = colorMonito;
    ctx.shadowColor = colorMonito; 
    ctx.shadowBlur = 10; 

    ctx.beginPath();
    ctx.moveTo(10, 240); ctx.lineTo(190, 240); 
    ctx.moveTo(50, 240); ctx.lineTo(50, 20);   
    ctx.moveTo(50, 20);  ctx.lineTo(120, 20);  
    ctx.stroke(); 

    ctx.save(); 
    ctx.shadowBlur = 2; 
    ctx.strokeStyle = '#a1a1a1'; 
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, 20); ctx.lineTo(120, 50);
    ctx.stroke();
    ctx.restore(); 

    if (errores >= 1) { 
        ctx.beginPath(); ctx.arc(120, 70, 20, 0, Math.PI * 2); ctx.stroke();
    }
    if (errores >= 2) { 
        ctx.beginPath(); ctx.moveTo(120, 90); ctx.lineTo(120, 160); ctx.stroke();
    }
    if (errores >= 3) { 
        ctx.beginPath(); ctx.moveTo(120, 110); ctx.lineTo(90, 140); ctx.stroke();
    }
    if (errores >= 4) { 
        ctx.beginPath(); ctx.moveTo(120, 110); ctx.lineTo(150, 140); ctx.stroke();
    }
    if (errores >= 5) { 
        ctx.beginPath(); ctx.moveTo(120, 160); ctx.lineTo(90, 210); ctx.stroke();
    }
    if (errores >= 6) { 
        ctx.beginPath(); ctx.moveTo(120, 160); ctx.lineTo(150, 210); ctx.stroke();
        ctx.shadowColor = '#ff0000';
        ctx.strokeStyle = '#ffcccc'; 
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(110, 65); ctx.lineTo(115, 70); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(115, 65); ctx.lineTo(110, 70); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(125, 65); ctx.lineTo(130, 70); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(130, 65); ctx.lineTo(125, 70); ctx.stroke();
    }
}

// --- REPARADO Y CONECTADO CON EFECTOS ---
async function finalizarNivel(victoria) {
    juegoBloqueado = true;
    btnPista.style.display = 'none'; 

    if (victoria) {
        mensajeEstado.textContent = '¡Enhorabuena! Palabra adivinada 🎉';
        btnSiguiente.style.display = 'block';
        reproducirSonido('victoria'); 
        
        // --- AQUÍ GUARDAMOS EN LA MEMORIA A CORTO PLAZO ---
        if (nivelActual === nivelMaximoGlobal) {
            nivelMaximoGlobal++; // Aumentamos el nivel máximo desbloqueado
            sessionStorage.setItem('max_nivel_ahorcado', nivelMaximoGlobal);
        }

    } else {
        mensajeEstado.textContent = `¡Game Over! La palabra era: ${palabraSecreta} 😢`;
        btnReintentar.style.display = 'block';
        reproducirSonido('perder'); 
    }
}

function cargarSiguienteNivel() { iniciarNivel(nivelActual + 1); }
function reintentarNivel() { iniciarNivel(nivelActual); } 

function generarBotonesNiveles() {
    cuadriculaNiveles.innerHTML = '';
    for (let i = 1; i <= 50; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        if (i > nivelMaximoGlobal) {
            btn.disabled = true;
        } else {
            btn.onclick = () => { cerrarSelectorNiveles(); iniciarNivel(i); };
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

async function cargarProgreso() {
    try {
        const res = await fetch('/ahorcado/progreso');
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
        const res = await fetch('/ahorcado/completar', {
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

// MOTOR DE EFECTOS DE SONIDO
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