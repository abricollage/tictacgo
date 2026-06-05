// Elementos del DOM originales
const txtNivel = document.getElementById('textoNivel');
const barExperiencia = document.getElementById('barraExperiencia');
const barHambre = document.getElementById('barraHambre');
const barDiversion = document.getElementById('barraDiversion');
const barEnergia = document.getElementById('barraEnergia');
const divListaJuegos = document.getElementById('listaJuegos');
const txtHongos = document.getElementById('cantHongos');
const modalComida = document.getElementById('modalComida');

// NUEVOS Elementos del DOM para el inventario (Asegúrate de agregarlos en tu HTML)
const modalInventario = document.getElementById('modalInventario');
const listaInventario = document.getElementById('listaInventario');

let datosMascota = null;

// NUEVO: Cargar inventario desde el almacenamiento local del navegador
let inventario = JSON.parse(localStorage.getItem('inventarioMascota')) || {
    manzana: 0,
    pizza: 0,
    sushi: 0
};

window.onload = async () => {
    await cargarEstadoMascota();
    iniciarCicloHambre();
};

async function cargarEstadoMascota() {
    try {
        const res = await fetch('/api/mascota');
        if (!res.ok) throw new Error('Error API');
        datosMascota = await res.json();
        actualizarInterfaz();
    } catch (error) {
        console.error("Error cargando mascota:", error);
    }
}

function actualizarInterfaz() {
    if (!datosMascota) return;

    txtNivel.textContent = datosMascota.nivel;
    barExperiencia.value = datosMascota.experiencia;
    barExperiencia.max = datosMascota.nivel * 100; 

    // Permitimos que la barra se llene hasta 200 visualmente
    barHambre.max = 200; 
    barHambre.value = datosMascota.hambre;
    
    barDiversion.value = datosMascota.diversion;
    barEnergia.value = datosMascota.energia;
    txtHongos.textContent = datosMascota.hongos;

    // Lanzar señal de alerta si llegó al 200% (empachado / lleno total)
    if (datosMascota.hambre >= 200) {
        barHambre.classList.add('alerta-hambre-critica'); // Clases CSS para parpadear
    } else {
        barHambre.classList.remove('alerta-hambre-critica');
    }
}

// --- VENTANAS (Modales) ---
function abrirMenuComida() { modalComida.style.display = 'flex'; }
function cerrarMenuComida() { modalComida.style.display = 'none'; }
function cerrarInventario() { modalInventario.style.display = 'none'; }

// --- NUEVO: SISTEMA DE INVENTARIO ---
function guardarInventario() {
    localStorage.setItem('inventarioMascota', JSON.stringify(inventario));
}

function abrirInventario() {
    modalInventario.style.display = 'flex';
    listaInventario.innerHTML = ''; 

    let hayItems = false;

    // Generar la lista de items guardados
    for (let item in inventario) {
        if (inventario[item] > 0) {
            hayItems = true;
            listaInventario.innerHTML += `
                <div class="item-comida">
                    <div class="comida-info">
                        <h4>${item.toUpperCase()}</h4>
                        <p>Cantidad: ${inventario[item]}</p>
                    </div>
                    <button class="btn-comprar" onclick="consumirItem('${item}')">Alimentar</button>
                </div>
            `;
        }
    }

    if (!hayItems) {
        listaInventario.innerHTML = '<p style="text-align:center; color: #fff9c4;">Tu mochila está vacía.</p>';
    }
}

// --- PROCESAR COMPRAS (Modificado) ---
async function comprarComida(tipoAlimento) {
    try {
        // NOTA: Tendrás que cambiar tu backend para que esta ruta SOLO cobre los hongos, sin subir el hambre.
        const res = await fetch('/api/mascota/comprar', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alimento: tipoAlimento })
        });
        
        const data = await res.json();
        if (!res.ok) {
            alert(data.error); 
            return;
        }
        
        datosMascota = data.mascota; // Actualizamos los hongos restados
        
        // Guardamos la comida en la mochila en lugar de dársela
        if(inventario[tipoAlimento] !== undefined) {
            inventario[tipoAlimento]++;
        } else {
            inventario[tipoAlimento] = 1;
        }
        
        guardarInventario();
        actualizarInterfaz();
        alert(`¡Compraste ${tipoAlimento}! Está en tu mochila.`);
        
    } catch (error) {
        console.error("Error en la compra:", error);
    }
}

// --- NUEVO: CONSUMIR ITEM DESDE INVENTARIO ---
async function consumirItem(tipoAlimento) {
    if (inventario[tipoAlimento] > 0) {
        try {
            // NOTA: Esta ruta debería subir las estadísticas de la mascota en el backend sin cobrar
            const res = await fetch('/api/mascota/alimentar', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ alimento: tipoAlimento })
            });

            if (!res.ok) throw new Error('Error al alimentar');
            const data = await res.json();
            
            // Si el backend aceptó la comida, la restamos de la mochila
            datosMascota = data.mascota;
            inventario[tipoAlimento]--;
            guardarInventario();
            
            actualizarInterfaz();
            abrirInventario(); // Refrescamos la mochila visualmente

        } catch (error) {
            console.error("Error al consumir:", error);
        }
    }
}

// --- CICLO DE ESTADÍSTICAS ---
function iniciarCicloHambre() {
    setInterval(() => {
        if (!datosMascota) return;
        datosMascota.hambre = Math.max(0, datosMascota.hambre - 2);
        datosMascota.diversion = Math.max(0, datosMascota.diversion - 2);
        datosMascota.energia = Math.max(0, datosMascota.energia + 2);
        actualizarInterfaz();
    }, 12000); 
}

// --- NUEVO: SEÑAL DE ALARMA DE HAMBRE ---
function verificarAlarmaHambre() {
    const imagenMascota = document.querySelector('.mascota-imagen');
    
    // Si el hambre llega a 15 o menos (estado crítico)
    if (datosMascota.hambre <= 15) {
        barHambre.classList.add('alerta-hambre');
        if(imagenMascota) imagenMascota.classList.add('mascota-temblando');
    } else {
        barHambre.classList.remove('alerta-hambre');
        if(imagenMascota) imagenMascota.classList.remove('mascota-temblando');
    }
}

function mostrarListaJuegos() { divListaJuegos.style.display = 'block'; divListaJuegos.scrollIntoView({ behavior: 'smooth' }); }
function ocultarListaJuegos() { divListaJuegos.style.display = 'none'; }