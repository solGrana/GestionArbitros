// --------------------
// dashboard.js
// --------------------

const token = localStorage.getItem("token");
if (!token) {
    alert("No estás logueado");
    window.location.href = "index.html";
}

// --------------------
// Funciones para obtener datos desde la API
// --------------------
async function fetchTorneos() {
    try {
        const res = await fetch("http://localhost:8000/torneos/", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Error al cargar torneos: ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}

async function fetchUsuarios() {
    try {
        const res = await fetch("http://localhost:8000/usuarios/", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || `Error ${res.status}`);
        }
        return await res.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}

async function fetchPartidos(torneo_id) {
    try {
        const res = await fetch(`http://localhost:8000/partidos/torneo/${torneo_id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Error al cargar partidos: ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}

// --------------------
// Función principal para renderizar el dashboard
// --------------------
async function renderDashboard() {
    // Torneos
    const torneos = await fetchTorneos();
    const torneosContainer = document.getElementById("torneos-container");
    if (torneosContainer) {
        const usuarios = await fetchUsuarios();
        torneosContainer.innerHTML = "";
        for (const torneo of torneos) {
            console.log("Torneo:", torneo);
            const orgNombre = buscarOrgPorId(torneo.organizacion_id, usuarios);
            
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `<strong>${torneo.nombre}</strong> | Organizador: ${orgNombre} <br>${torneo.descripcion}<br>Inicio: ${torneo.fecha_inicio} | Fin: ${torneo.fecha_fin}`;
            torneosContainer.appendChild(card);
            
            // Cargar partidos de cada torneo
            const partidos = await fetchPartidos(torneo.id);
            const partidosTbody = document.querySelector("#partidos-table tbody");
            if (partidosTbody) {
                for (const p of partidos) {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${p.id}</td>
                        <td>${torneo.nombre}</td>
                        <td>${p.fecha_hora}</td>
                        <td>${p.cancha}</td>
                        <td>${p.cantidad_arbitros}</td>
                        <td>${p.cantidad_asistentes}</td>
                        `;
                        partidosTbody.appendChild(row);
                    }
                }
            }
        }
        
        // Usuarios
        const usuarios = await fetchUsuarios();
        const usuariosTbody = document.querySelector("#usuarios-table tbody");
        if (usuariosTbody) {
            if (!Array.isArray(usuarios)) {
                console.error("Usuarios no es un array:", usuarios);
                usuariosTbody.innerHTML = `<tr><td colspan="4">No se pudieron cargar los usuarios</td></tr>`;
            } else {
                usuariosTbody.innerHTML = "";
                for (const u of usuarios) {
                    const row = document.createElement("tr");
                    row.innerHTML = `<td>${u.id}</td><td>${u.nombre}</td><td>${u.email}</td><td>${u.rol}</td>`;
                    usuariosTbody.appendChild(row);
                }
            }
        }
    }
    
    // --------------------
    // Abrir/Cerrar Modales
    // --------------------
    document.querySelectorAll(".admin-actions button").forEach(btn => {
        btn.addEventListener("click", e => {
            const target = btn.id.replace("btn-crear-", "modal-");
            document.getElementById(target).style.display = "block";
        });
    });
    
    document.querySelectorAll(".modal .close").forEach(span => {
        span.addEventListener("click", e => {
            document.getElementById(span.dataset.modal).style.display = "none";
        });
    });
    
    // --------------------
    // Cargar opciones dinámicas
    // --------------------
    async function cargarOpcionesPartido() {
        const torneos = await fetchTorneos();
        const usuarios = await fetchUsuarios();
        
        const torneoSelect = document.querySelector("#form-partido select[name='torneo_id']");
        const arbitroSelect = document.querySelector("#form-partido select[name='arbitro']");
        const asistentesSelect = document.querySelector("#form-partido select[name='asistentes']");
        
        if (torneoSelect) {
            torneoSelect.innerHTML = "<option value=''>-- Seleccionar Torneo --</option>";
            torneos.forEach(t => {
                const opt = document.createElement("option");
            opt.value = t.id;
            opt.textContent = t.nombre;
            torneoSelect.appendChild(opt);
        });
    }
    
    const arbitros = usuarios.filter(u => u.rol === "arbitro");
    const organizaciones = usuarios.filter(u => u.rol === "organizacion");
    
    if (arbitroSelect) {
        arbitroSelect.innerHTML = "<option value=''>-- Seleccionar Árbitro --</option>";
        arbitros.forEach(u => {
            const opt = document.createElement("option");
            opt.value = u.id;
            opt.textContent = u.nombre;
            arbitroSelect.appendChild(opt);
        });
    }
    
    if (asistentesSelect) {
        asistentesSelect.innerHTML = "";
        usuarios.forEach(u => {
            const opt = document.createElement("option");
            opt.value = u.id;
            opt.textContent = u.nombre + " (" + u.rol + ")";
            asistentesSelect.appendChild(opt);
        });
    }
}

async function cargarOpcionesTorneo() {
    const usuarios = await fetchUsuarios();
    const orgSelect = document.querySelector("#form-torneo select[name='organizacion_id']");
    
    if (orgSelect) {
        orgSelect.innerHTML = "<option value=''>-- Seleccionar Organización --</option>";
        const organizaciones = usuarios.filter(u => u.rol === "organizacion");
        organizaciones.forEach(org => {
            const opt = document.createElement("option");
            opt.value = org.id;
            opt.textContent = org.nombre;
            orgSelect.appendChild(opt);
        });
    }
}

// Ejecutar al abrir el modal de torneo
document.getElementById("btn-crear-torneo").addEventListener("click", cargarOpcionesTorneo);


// --------------------
// Crear Usuario
// --------------------
document.getElementById("form-usuario").addEventListener("submit", async e => {
    e.preventDefault();
    const form = e.target;
    const data = {
        nombre: form.nombre.value,
        email: form.email.value,
        password: form.password.value,
        rol: form.rol.value,
        localidad: form.localidad.value
    };
    
    try {
        const res = await fetch("http://localhost:8000/usuarios/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw await res.json();
        alert("Usuario creado!");
        form.reset();
        document.getElementById("modal-usuario").style.display = "none";
        renderDashboard(); // recargar usuarios
    } catch (err) {
        alert("Error: " + JSON.stringify(err.detail || err));
    }
});

// --------------------
// Crear Torneo
// --------------------
document.getElementById("form-torneo").addEventListener("submit", async e => {
    e.preventDefault();
    const form = e.target;
    const data = {
        nombre: form.nombre.value,
        descripcion: form.descripcion.value,
        fecha_inicio: form.fecha_inicio.value,
        fecha_fin: form.fecha_fin.value,
        organizacion_id: parseInt(form.organizacion_id.value)
    };
    
    try {
        const res = await fetch("http://localhost:8000/torneos/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw await res.json();
        alert("Torneo creado!");
        form.reset();
        document.getElementById("modal-torneo").style.display = "none";
        renderDashboard(); // recargar torneos
    } catch (err) {
        alert("Error: " + JSON.stringify(err.detail || err));
    }
});

// --------------------
// Crear Partido
// --------------------
document.getElementById("form-partido").addEventListener("submit", async e => {
    e.preventDefault();
    const form = e.target;
    const arbitroId = parseInt(form.arbitro.value);
    const asistentesIds = Array.from(form.asistentes.selectedOptions).map(o => parseInt(o.value));
    
    const data = {
        torneo_id: parseInt(form.torneo_id.value),
        fecha_hora: form.fecha_hora.value + ":00",
        cancha: form.cancha.value,
        cantidad_arbitros: 1,
        cantidad_asistentes: asistentesIds.length,
        modalidad_pago: form.modalidad_pago.value,
        valor_arbitro: parseInt(form.valor_arbitro.value),
        valor_asistente: parseInt(form.valor_asistente.value)
    };
    
    try {
        const res = await fetch("http://localhost:8000/partidos/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw await res.json();
        alert("Partido creado!");
        form.reset();
        document.getElementById("modal-partido").style.display = "none";
        renderDashboard(); // recargar partidos
    } catch (err) {
        alert("Error: " + JSON.stringify(err.detail || err));
    }
});

// --------------------
// Cargar opciones al abrir el modal de partido
// --------------------
document.getElementById("btn-crear-partido").addEventListener("click", cargarOpcionesPartido);


// --------------------
// Ejecutar al cargar la página
// --------------------
document.addEventListener("DOMContentLoaded", renderDashboard);


function buscarOrgPorId(id, usuarios) {
    console.log("Buscando organización para ID:", id);
    const org = usuarios.find(u => u.rol === "organizacion" && u.id === id);
    return org ? org.nombre : "Desconocida";
}
