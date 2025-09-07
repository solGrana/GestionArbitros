const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    console.log("entraste al Login");
    try {
        const res = await fetch("http://localhost:8000/auth/login", {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: new URLSearchParams({username: email, password: password})
        });

        if (!res.ok) throw new Error("Login fallido");
        const data = await res.json();

        // Guardar tokens en localStorage
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);

        // Redirigir al dashboard
        window.location.href = "dashboard.html";
    } catch (err) {
        alert(err.message);
    }
});
