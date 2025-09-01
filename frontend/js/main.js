const form = document.getElementById("loginForm");
const errorDiv = document.getElementById("error");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    console.log(email, password);
    try {
        const data = await login(email, password);
        console.log(data)
        localStorage.setItem("token", data.access_token);
        window.location.href = "dashboard.html"; // redirige al dashboard
    } catch (err) {
        errorDiv.textContent = err.message;
    }
});

document.addEventListener("DOMContentLoaded", () => {
  console.log("JS cargado");

  const form = document.getElementById("loginForm");
  console.log("Form:", form);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("Submit disparado");
  });
});

