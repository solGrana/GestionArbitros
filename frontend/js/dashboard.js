const api = (() => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No estás logueado");
        window.location.href = "index.html";
    }

    const headers = { "Authorization": `Bearer ${token}` };

    const fetchJSON = async (url) => {
        try {
            const res = await fetch(url, { headers });
            if (!res.ok) throw new Error(`Error ${res.status}`);
            return await res.json();
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    const postJSON = async (url, data) => {
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { ...headers, "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw await res.json();
            return await res.json();
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    return {
        getTorneos: () => fetchJSON("http://localhost:8000/torneos/"),
        getUsuarios: () => fetchJSON("http://localhost:8000/usuarios/"),
        getPartidos: (torneo_id) => fetchJSON(`http://localhost:8000/partidos/torneo/${torneo_id}`),
        getAsignaciones: (partido_id) => fetchJSON(`http://localhost:8000/asignaciones/partido/${partido_id}`),
        post: postJSON
    };
})();

// Funciones utiles

function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(fecha.getDate())}/${pad(fecha.getMonth()+1)}/${fecha.getFullYear()} ${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
}
function formatearFechaSoloDia(fechaISO) {
    const fechaConHora = formatearFecha(fechaISO); 
    return fechaConHora.split(' ')[0];              
}

function buscarOrgPorId(id, usuarios) {
    const org = usuarios.find(u => u.rol === "organizacion" && u.id === id);
    return org ? org.nombre : "Desconocida";
}

function crearFilaTabla(celdas) {
    const row = document.createElement("tr");
    row.innerHTML = celdas.map(c => `<td>${c}</td>`).join("");
    return row;
}

function limpiarSelect(select, placeholder) {
    select.innerHTML = `<option value="">${placeholder}</option>`;
}

function toggleModal(modalId, show) {
    document.getElementById(modalId).style.display = show ? "block" : "none";
}


//render

async function renderTorneos(torneos, usuarios) {
    const container = document.getElementById("torneos-container");
    container.innerHTML = "";
    for (const t of torneos) {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <strong>${t.nombre}</strong> | Organizador: ${buscarOrgPorId(t.organizacion_id, usuarios)} 
            <br>${t.descripcion}
            <br>Inicio: ${formatearFechaSoloDia(t.fecha_inicio)} | Fin: ${formatearFechaSoloDia(t.fecha_fin)}
        `;
        container.appendChild(card);
    }
}

async function renderPartidos(torneos) {
    const tbody = document.querySelector("#partidos-table tbody");
    tbody.innerHTML = "";

    const usuarios = await api.getUsuarios();

    for (const t of torneos) {
        const partidos = await api.getPartidos(t.id);
        for (const p of partidos) {
            const asignaciones = await api.getAsignaciones(p.id);
            const arbitros = asignaciones.filter(a => a.rol==="arbitro").map(a => a.user.nombre).join(", ") || "-";
            const asistentes = asignaciones.filter(a => a.rol==="asistente").map(a => a.user.nombre).join(", ") || "-";
            tbody.appendChild(crearFilaTabla([t.nombre, formatearFecha(p.fecha_hora), p.cancha, arbitros, asistentes]));
        }
    }
}

async function renderUsuarios() {
    const tbody = document.querySelector("#usuarios-table tbody");
    const usuarios = await api.getUsuarios();
    tbody.innerHTML = "";
    for (const u of usuarios) {
        tbody.appendChild(crearFilaTabla([u.nombre, u.email, u.rol]));
    }
}

async function renderDashboard() {
    const torneos = await api.getTorneos();
    const usuarios = await api.getUsuarios();

    await renderTorneos(torneos, usuarios);
    await renderPartidos(torneos);
    await renderUsuarios();
}


// carga de opciones en selects

async function cargarOpcionesTorneo() {
    const usuarios = await api.getUsuarios();
    const orgSelect = document.querySelector("#form-torneo select[name='organizacion_id']");
    limpiarSelect(orgSelect, "-- Seleccionar Organización --");

    usuarios.filter(u => u.rol==="organizacion").forEach(org => {
        const opt = document.createElement("option");
        opt.value = org.id;
        opt.textContent = org.nombre;
        orgSelect.appendChild(opt);
    });
}

async function cargarOpcionesPartido() {
    const torneos = await api.getTorneos();
    const usuarios = await api.getUsuarios();

    const torneoSelect = document.querySelector("#form-partido select[name='torneo_id']");
    const arbitroSelect = document.querySelector("#form-partido select[name='arbitro']");
    const asistentesSelect = document.querySelector("#form-partido select[name='asistentes']");

    limpiarSelect(torneoSelect, "-- Seleccionar Torneo --");
    torneos.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t.id;
        opt.textContent = t.nombre;
        torneoSelect.appendChild(opt);
    });

    limpiarSelect(arbitroSelect, "-- Seleccionar Árbitro --");
    const arbitros = usuarios.filter(u => u.rol==="arbitro");
    arbitros.forEach(a => {
        const opt = document.createElement("option");
        opt.value = a.id;
        opt.textContent = a.nombre;
        arbitroSelect.appendChild(opt);
    });

    // Select multiple de asistentes
    asistentesSelect.innerHTML = "";
    const asistentes = usuarios.filter(u => u.rol==="arbitro");
    asistentes.forEach(a => {
        const opt = document.createElement("option");
        opt.value = a.id;
        opt.textContent = a.nombre;
        asistentesSelect.appendChild(opt);
    });

    // Hack para seleccionar sin Ctrl
    asistentesSelect.addEventListener("mousedown", e => {
        e.preventDefault();
        if (e.target.tagName === "OPTION") e.target.selected = !e.target.selected;
    });
}


// Funciones para crear nuevos recursos

async function crearUsuario(form) {
    const data = {
        nombre: form.nombre.value,
        email: form.email.value,
        password: form.password.value,
        rol: form.rol.value,
        localidad: form.localidad.value
    };
    await api.post("http://localhost:8000/usuarios/", data);
    alert("Usuario creado!");
    form.reset();
    toggleModal("modal-usuario", false);
    renderUsuarios();
}

async function crearTorneo(form) {
    const data = {
        nombre: form.nombre.value,
        descripcion: form.descripcion.value,
        fecha_inicio: form.fecha_inicio.value,
        fecha_fin: form.fecha_fin.value,
        organizacion_id: parseInt(form.organizacion_id.value)
    };
    await api.post("http://localhost:8000/torneos/", data);
    alert("Torneo creado!");
    form.reset();
    toggleModal("modal-torneo", false);
    renderDashboard();
}

async function crearPartido(form) {
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

    const partidoCreado = await api.post("http://localhost:8000/partidos/", data);

    await api.post(`http://localhost:8000/asignaciones/${partidoCreado.id}`, {
        arbitro_ids: [arbitroId],
        asistente_ids: asistentesIds
    });

    alert("Partido y asignaciones creados!");
    form.reset();
    toggleModal("modal-partido", false);
    renderDashboard();
}


// events listeners

document.addEventListener("DOMContentLoaded", renderDashboard);

document.getElementById("btn-crear-torneo").addEventListener("click", cargarOpcionesTorneo);
document.getElementById("btn-crear-partido").addEventListener("click", cargarOpcionesPartido);

document.getElementById("form-usuario").addEventListener("submit", e => { e.preventDefault(); crearUsuario(e.target); });
document.getElementById("form-torneo").addEventListener("submit", e => { e.preventDefault(); crearTorneo(e.target); });
document.getElementById("form-partido").addEventListener("submit", e => { e.preventDefault(); crearPartido(e.target); });

// Modales
document.querySelectorAll(".admin-actions button").forEach(btn => {
    btn.addEventListener("click", () => toggleModal(btn.id.replace("btn-crear-", "modal-"), true));
});
document.querySelectorAll(".modal .close").forEach(span => {
    span.addEventListener("click", () => toggleModal(span.dataset.modal, false));
});
