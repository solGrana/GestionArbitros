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
  return await res.json(); // devuelve {access_token, token_type}
}

async function getMatches(token) {
  const res = await fetch(`${API_URL}/partidos/torneo/1`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return await res.json();
}
