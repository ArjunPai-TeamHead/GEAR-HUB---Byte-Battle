const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!username || !email || !password) {
            alert("Please fill in all fields!");
            return;
        }

        // Save user in local storage
        localStorage.setItem("user", JSON.stringify({
            username: username,
            email: email,
            password: password
        }));

        alert("Account created successfully!");
        window.location.href = "login.html";
    });
}


// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        const savedUser = JSON.parse(localStorage.getItem("user"));

        if (!savedUser) {
            alert("No user found. Please sign up first!");
            window.location.href = "signup.html";
            return;
        }

        if (email === savedUser.email && password === savedUser.password) {
            alert("Login successful!");
            window.location.href = "dashboard.html";
        } else {
            alert("Invalid email or password!");
        }
    });
}
// navbar placeholder file (expandable later)
console.log("Navbar loaded");
