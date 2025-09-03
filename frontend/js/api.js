const API_URL = "http://localhost:8000";

async function login(email, password) {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Error desconocido");
  }
  const data = await res.json();
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
  return data;
   // return await res.json();devuelve {access_token, token_type}
}

// Refrescar token
async function refreshToken() {
  const refresh_token = localStorage.getItem("refresh_token");
  if (!refresh_token) return null;

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ refresh_token })
  });

  if (!res.ok) {
    console.error("No se pudo refrescar el token");
    localStorage.clear();
    return null;
  }

  const data = await res.json();
  localStorage.setItem("access_token", data.access_token);
  return data.access_token;
}

// Wrapper para llamadas API que reintenta si expira el access_token
async function apiFetch(endpoint, options = {}) {
  let token = localStorage.getItem("access_token");
  console.log("Token actual:", token);
  if (!options.headers) options.headers = {};
  options.headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(`${API_URL}${endpoint}`, options);

  if (res.status === 401) {
    const newToken = await refreshToken();
    if (newToken) {
      options.headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${API_URL}${endpoint}`, options);
    }
  }

  return res;
}

async function getMatches(token) {
  const res = await fetch(`${API_URL}/partidos/torneo/1`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return await res.json();
}
