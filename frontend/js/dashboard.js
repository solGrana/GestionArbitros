const api = (() => {

    const fetchJSON = async (url, options = {}) => {
        try {
            const res = await fetchWithAuth(url, options);
            if (!res.ok) throw new Error(`Error ${res.status}`);
            return await res.json();
        } catch (err) {
            console.error(err);
            return [];
        }
    };
    
    const postJSON = async (url, data) => {
        const res = await fetchWithAuth(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw await res.json();
        return res.json();
    };

    const putJSON = async (url, data) => {
        const res = await fetchWithAuth(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw await res.json();
        return res.json();
    };

    const deleteJSON = async (url) => {
        const res = await fetchWithAuth(url, { method: "DELETE" });
        if (!res.ok) throw await res.json();
        return res.json();
    };

    return {
        getTorneos: () => fetchJSON("http://localhost:8000/torneos/"),
        getUsuarios: () => fetchJSON("http://localhost:8000/usuarios/"),
        getPartidos: (torneo_id) => fetchJSON(`http://localhost:8000/partidos/torneo/${torneo_id}`),
        getAsignaciones: (partido_id) => fetchJSON(`http://localhost:8000/asignaciones/partido/${partido_id}`),
        post: postJSON,
        put: putJSON,
        delete: deleteJSON
    };
})();

const filtrosUsuarios = {
    rol: "",
    localidad: ""
};

const tokenManager = {
    get access() {
        return localStorage.getItem("token");
    },
    set access(token) {
        localStorage.setItem("token", token);
    },
    get refresh() {
        return localStorage.getItem("refresh_token");
    },
    set refresh(token) {
        localStorage.setItem("refresh_token", token);
    },
    clear() {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
    }
};

// Funciones utiles

function forceLogin() {
    window.location.href = "/frontend/index.html";
}

async function cargarArbitros(select) {
    limpiarSelect(select, "-- Seleccionar Árbitro --");
    const usuarios = await api.getUsuarios();
    usuarios.filter(u => u.rol === "arbitro").forEach(a => {
        const opt = document.createElement("option");
        opt.value = a.id;
        opt.textContent = a.nombre;
        select.appendChild(opt);
    });
}
async function cargarAsistentes(select) {
    select.innerHTML = "";
    const usuarios = await api.getUsuarios();
    usuarios.filter(u => u.rol === "arbitro").forEach(a => {
        const opt = document.createElement("option");
        opt.value = a.id;
        opt.textContent = a.nombre;
        select.appendChild(opt);
    });
}
function cargarTorneos(select, torneos, placeholder = "-- Seleccionar Torneo --") {
  limpiarSelect(select, placeholder);
  torneos.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = t.nombre;
    select.appendChild(opt);
  });
}
function cargarOrganizaciones(select, org, placeholder = "-- Seleccionar Organización --") {
        const opt = document.createElement("option");
        opt.value = org.id;
        opt.textContent = org.nombre;
        select.appendChild(opt);
}


// Función para cambiar de sección
function mostrarSeccion(seccionId) {
    document.querySelectorAll('.section').forEach(sec => {
        sec.style.display = 'none'; // Oculta todas las secciones
    });
    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const section = document.getElementById(seccionId);
    const button = document.querySelector(`.sidebar-btn[data-section="${seccionId}"]`);
    if (section && button) {
        section.style.display = 'block'; // Muestra solo la sección activa
        button.classList.add('active');  // Marca el botón activo
    }
    console.log("función mostrarSeccion ejecutada");
}

function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(fecha.getDate())}/${pad(fecha.getMonth() + 1)}/${fecha.getFullYear()} ${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
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
    const container = document.getElementById("partidos-container");
    container.innerHTML = "";

    const usuarios = await api.getUsuarios();
    const partidosPorOrg = {};

    // Agrupar partidos por organizador
    for (const t of torneos) {
        const partidos = await api.getPartidos(t.id);
        const organizador = buscarOrgPorId(t.organizacion_id, usuarios);

        if (!partidosPorOrg[organizador]) {
            partidosPorOrg[organizador] = { partidos: [], torneos: [] };
        }

        partidosPorOrg[organizador].torneos.push(t); // guardo torneos de ese organizador

        for (const p of partidos) {
            const asignaciones = await api.getAsignaciones(p.id);
            const arbitros = asignaciones.filter(a => a.rol === "arbitro").map(a => a.user.nombre).join(", ") || "-";
            const asistentes = asignaciones.filter(a => a.rol === "asistente").map(a => a.user.nombre).join(", ") || "-";

            partidosPorOrg[organizador].partidos.push({
                id: p.id,
                torneo: t.nombre,
                fecha: formatearFecha(p.fecha_hora),
                cancha: p.cancha,
                arbitros,
                asistentes,
                equipo_local: p.equipo_local,
                equipo_visitante: p.equipo_visitante
            });
        }
    }

    // Renderizar una tabla por organizador
    Object.entries(partidosPorOrg).forEach(([org, data]) => {
        const { partidos, torneos } = data;

        // Título del organizador
        const title = document.createElement("h3");
        title.textContent = `Organizador: ${org}`;
        title.classList.add("organizador-title");
        container.appendChild(title);

        // Botón para cargar partido
        const btn = document.createElement("button");
        btn.textContent = "Cargar Partido";
        btn.classList.add("btn-crear-partido");
        btn.addEventListener("click", () => {
            // Abre modal
            toggleModal("modal-partido", true);

            // Cargar torneos SOLO del organizador
            const torneoSelect = document.querySelector("#form-partido select[name='torneo_id']");
            cargarTorneos(torneoSelect, torneos, "-- Selecciona Torneo del Organizador --");


            cargarOpcionesPartido(torneos);
        });
        container.appendChild(btn);

        // Tabla de partidos
        const table = document.createElement("table");
        table.classList.add("partidos-table");
        table.innerHTML = `
      <thead>
        <tr>
          <th>Torneo</th>
          <th>Fecha / Hora</th>
          <th>Cancha</th>
          <th>Local</th>
          <th>Visitante</th>
          <th>Árbitros</th>
          <th>Asistentes</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

        const tbody = table.querySelector("tbody");
        partidos.forEach(p => {
            tbody.appendChild(crearFilaTabla([
                p.torneo,
                p.fecha,
                p.cancha,
                p.equipo_local,
                p.equipo_visitante,
                p.arbitros,
                p.asistentes,
                `
  <div class="td-acciones">
    <button class="btn-assign" data-id="${p.id}">Asignar</button>
    <button class="btn-edit" id="edit-partido" data-id="${p.id}">Editar</button>
    <button class="btn-delete" id="delete-partido" data-id="${p.id}">Eliminar</button>
  </div>
`
            ]));
        });

        container.appendChild(table);
        container.appendChild(document.createElement("br"));
    });
}


async function renderUsuarios(filtros = {}) {
    const tbody = document.querySelector("#usuarios-table tbody");
    const usuarios = await api.getUsuarios();
    tbody.innerHTML = "";

    const usuariosFiltrados = usuarios.filter(u => {
        for (const key in filtros) {
            if (filtros[key] && u[key] !== filtros[key]) return false;
        }
        return true;
    });

    for (const u of usuariosFiltrados) {
        tbody.appendChild(crearFilaTabla([u.nombre, u.email, u.rol, `
        <div class="td-acciones">
        <button class="btn-edit" id="edit-user" data-id="${u.id}">Editar</button>
        <button class="btn-delete" id="delete-user" data-id="${u.id}">Eliminar</button>
        </div>
        `]));
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

    usuarios.filter(u => u.rol === "organizacion").forEach(org => {
        cargarOrganizaciones(orgSelect, org);
    });
}

async function cargarOpcionesPartido(torneosFiltrados = null) {
    const torneoSelect = document.querySelector("#form-partido select[name='torneo_id']");
    const arbitroSelect = document.querySelector("#form-partido select[name='arbitro']");
    const asistentesSelect = document.querySelector("#form-partido select[name='asistentes']");

    // Si no vienen torneos filtrados pedir todos
    let torneos = torneosFiltrados;
    if (!torneos) {
        torneos = await api.getTorneos();
    }

    // Cargar torneos
    cargarTorneos(torneoSelect, torneos);

    //cargar árbitros y asistentes
    cargarArbitros(arbitroSelect);
    cargarAsistentes(asistentesSelect);

    // Hack para seleccionar sin Ctrl
    asistentesSelect.addEventListener("mousedown", e => {
        e.preventDefault();
        if (e.target.tagName === "OPTION") {
            e.target.selected = !e.target.selected;
        }
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
        equipo_local: form.equipo_local.value,
        equipo_visitante: form.equipo_visitante.value,
        cantidad_arbitros: 1,
        cantidad_asistentes: asistentesIds.length,
        modalidad_pago: form.modalidad_pago.value,
        valor_arbitro: parseInt(form.valor_arbitro.value),
        valor_asistente: parseInt(form.valor_asistente.value)
    };

    const partidoCreado = await api.post("http://localhost:8000/partidos/", data);

    //  solo asignar si hay árbitro o asistentes seleccionados
    if (arbitroId || asistentesIds.length > 0) {
        await api.post(`http://localhost:8000/asignaciones/${partidoCreado.id}`, {
            arbitro_ids: arbitroId ? [arbitroId] : [],
            asistente_ids: asistentesIds
        });
    }

    alert("Partido creado!");
    form.reset();
    toggleModal("modal-partido", false);
    renderDashboard();
}

function asignarArbitros() {
    document.addEventListener("click", async (e) => {
        if (!e.target.classList.contains("btn-assign")) return;
        
        console.log("click en asignar árbitros");
        const partidoId = e.target.dataset.id;
        const usuarios = await api.getUsuarios();

        const arbitroSelect = document.querySelector("#form-asignar-arbitros select[name='arbitro']");
        const asistentesSelect = document.querySelector("#form-asignar-arbitros select[name='asistentes']");

        cargarArbitros(arbitroSelect);
        cargarAsistentes(asistentesSelect);

        if (!asistentesSelect.dataset.mousedownAttached) {
            asistentesSelect.addEventListener("mousedown", e2 => {
                e2.preventDefault();
                if (e2.target.tagName === "OPTION") {
                    e2.target.selected = !e2.target.selected;
                }
            });
            asistentesSelect.dataset.mousedownAttached = true;
        }
        
        const form = document.getElementById("form-asignar-arbitros");
        form.dataset.partidoId = partidoId; // guardamos id en el form
        // Abrir modal
        toggleModal("modal-asignar-arbitros", true);

        // Manejar submit del form
        form.onsubmit = async ev => {
            ev.preventDefault();
            
            const id = form.dataset.partidoId; // recuperamos id
            if (!id) return alert("Error: no se encontró el partido.");

            const arbitroId = form.arbitro.value ? [parseInt(form.arbitro.value)] : [];
            const asistentesIds = Array.from(form.asistentes.selectedOptions).map(o => parseInt(o.value));

            // Revisar si ya hay asignaciones
            const asignacionesExistentes = await api.getAsignaciones(id);

            if (asignacionesExistentes.length > 0) {
                // PUT para actualizar
                await api.put(`http://localhost:8000/asignaciones/${id}`, {
                    arbitro_ids: arbitroId,
                    asistente_ids: asistentesIds
                });
            } else {
                // POST para crear nuevas
                await api.post(`http://localhost:8000/asignaciones/${id}`, {
                    arbitro_ids: arbitroId,
                    asistente_ids: asistentesIds
                });
            }

            alert("Asignaciones guardadas!");
            toggleModal("modal-asignar-arbitros", false);
            renderDashboard();
        };
    });
}

// Manejo de tokens y fetch con autenticación
async function refreshToken() {
    console.log("refreshToken llamado");
    if (!tokenManager.refresh) {
        forceLogin();
        return null;
    }

    try {
        const res = await fetch("http://localhost:8000/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: tokenManager.refresh })
        });

        if (!res.ok) throw new Error("No se pudo refrescar token");

        const data = await res.json();
        tokenManager.access = data.access_token;
        return data.access_token;
    } catch (err) {
        console.error("Error al refrescar:", err);
        tokenManager.clear();
        forceLogin();
        return null;
    }
}

async function fetchWithAuth(url, options = {}) {
    let token = tokenManager.access;

    options.headers = {
        ...options.headers,
        "Authorization": `Bearer ${token}`
    };

    let res = await fetch(url, options);

    if (res.status === 401) {
        console.warn("Token expirado, intentando refrescar...");
        const newToken = await refreshToken();
        if (!newToken) return res; 

        options.headers["Authorization"] = `Bearer ${newToken}`;
        res = await fetch(url, options);
    }

    return res;
}


//Eliminaciones

function eliminarPartidos() {
    document.addEventListener("click", async (e) => {
        if (e.target.id !== "delete-partido") return;

        const partidoId = e.target.dataset.id;
        if (!partidoId) return alert("No se encontró el partido.");

        const confirmar = confirm("¿Estás seguro que deseas eliminar este partido?");
        if (!confirmar) return;

        try {
            await api.delete(`http://localhost:8000/partidos/${partidoId}`);
            alert("Partido eliminado correctamente");
            renderDashboard(); // recarga la tabla
        } catch (err) {
            console.error(err);
            alert("No se pudo eliminar el partido: " + (err?.detail || err.message));
        }
    });
}

// events listeners

document.addEventListener('DOMContentLoaded', () => {
    // Ocultar todas las secciones excepto la primera
    document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');
    // Listener de botones del sidebar
    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.addEventListener('click', () => mostrarSeccion(btn.dataset.section));
    });
    // Mostrar sección por default
    mostrarSeccion('torneos-section');
    renderDashboard();

    // Inicializar asignación de árbitros
    asignarArbitros();
    eliminarPartidos();
});

/* document.addEventListener("DOMContentLoaded", renderDashboard); */

document.getElementById("btn-crear-torneo").addEventListener("click", cargarOpcionesTorneo);
/* document.getElementById("btn-crear-partido").addEventListener("click", cargarOpcionesPartido); */

document.getElementById("form-usuario").addEventListener("submit", e => { e.preventDefault(); crearUsuario(e.target); });
document.getElementById("form-torneo").addEventListener("submit", e => { e.preventDefault(); crearTorneo(e.target); });
document.getElementById("form-partido").addEventListener("submit", e => { e.preventDefault(); crearPartido(e.target); });

// Listener para el filtro de rol
document.getElementById("filtro-rol").addEventListener("change", (e) => {
    filtrosUsuarios.rol = e.target.value;
    renderUsuarios(filtrosUsuarios);
});

// Modales
document.querySelectorAll(".admin-actions button").forEach(btn => {
    btn.addEventListener("click", () => toggleModal(btn.id.replace("btn-crear-", "modal-"), true));
});
document.querySelectorAll(".modal .close").forEach(span => {
    span.addEventListener("click", () => toggleModal(span.dataset.modal, false));
});
