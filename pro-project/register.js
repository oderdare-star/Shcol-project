// ========================
// REGISTER.JS
// ========================
const API_URL = "https://69ecc98baf4ff533142b610f.mockapi.io/Stagiaire";

const registerForm = document.getElementById("registerForm");
const alertBox = document.getElementById("alertBox");
const registerBtn = document.getElementById("registerBtn");

// ---- Role selector ----
document.querySelectorAll(".role-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".role-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("admin").value = btn.dataset.value;

    // Update step indicator
    const isAdmin = btn.dataset.value === "true";
    document.querySelectorAll(".step-item").forEach((s, i) => {
      s.classList.toggle("active", i === (isAdmin ? 1 : 0));
    });
  });
});

// ---- Color picker ----
const colorPicker = document.getElementById("couleur");
const colorHex = document.getElementById("colorHex");
if (colorPicker) {
  colorPicker.addEventListener("input", () => {
    colorHex.textContent = colorPicker.value;
  });
}

// ---- Password visibility toggles ----
document.querySelectorAll(".toggle-password").forEach(btn => {
  btn.addEventListener("click", () => {
    const input = btn.closest(".input-wrapper").querySelector("input");
    const isText = input.type === "text";
    input.type = isText ? "password" : "text";
    btn.querySelector("svg").style.opacity = isText ? "1" : "0.5";
  });
});

// ---- Password strength meter ----
const passInput = document.getElementById("MotDePasse");
const strengthBar = document.getElementById("strengthBar");
const strengthFill = document.getElementById("strengthFill");
const strengthLabel = document.getElementById("strengthLabel");

passInput.addEventListener("input", () => {
  const val = passInput.value;
  if (!val) { strengthBar.style.display = "none"; return; }

  strengthBar.style.display = "flex";

  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[\W_]/.test(val)) score++;
  if (val.length >= 12) score++;

  const levels = [
    { width: "20%", color: "#dc2626", label: "Very weak" },
    { width: "40%", color: "#f97316", label: "Weak" },
    { width: "60%", color: "#eab308", label: "Fair" },
    { width: "80%", color: "#22c55e", label: "Strong" },
    { width: "100%", color: "#16a34a", label: "Very strong" }
  ];

  const lvl = levels[Math.min(score - 1, 4)] || levels[0];
  strengthFill.style.width = lvl.width;
  strengthFill.style.background = lvl.color;
  strengthLabel.textContent = lvl.label;
  strengthLabel.style.color = lvl.color;
});

// ---- Field helpers ----
function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearErrors() {
  ["nomError","ageError","pseudoError","emailError","passError","confirmPassError"].forEach(id => setError(id, ""));
  document.querySelectorAll(".form-group input").forEach(i => {
    i.classList.remove("error", "valid");
  });
}

function markInput(id, valid, errorId, msg) {
  const input = document.getElementById(id);
  if (!input) return;
  input.classList.toggle("error", !valid);
  input.classList.toggle("valid", valid);
  if (!valid && errorId) setError(errorId, msg);
}

function showAlert(msg, type = "error") {
  alertBox.textContent = msg;
  alertBox.className = `alert-box ${type}`;
  alertBox.style.display = "block";
}

function setLoading(on) {
  registerBtn.disabled = on;
  registerBtn.querySelector(".btn-text").style.display = on ? "none" : "inline";
  registerBtn.querySelector(".btn-spinner").style.display = on ? "flex" : "none";
}

// ---- Regex ----
const nameRegex = /^[A-Za-zÀ-ÿ\s]{2,}$/;
const pseudoRegex = /^[A-Za-z0-9_]{3,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---- Submit ----
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErrors();
  alertBox.style.display = "none";

  const nom = document.getElementById("nom").value.trim();
  const prenom = document.getElementById("prenom").value.trim();
  const ageInput = document.getElementById("age").value.trim();
  const pseudo = document.getElementById("pseudo").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const MotDePasse = document.getElementById("MotDePasse").value;
  const MotDePasseCon = document.getElementById("MotDePasseConfirmation").value;
  const couleur = document.getElementById("couleur")?.value || "#4a6cf7";
  const Devise = document.getElementById("Devise")?.value.trim() || "";
  const Pays = document.getElementById("Pays")?.value.trim() || "";
  const avatar = document.getElementById("avatar")?.value.trim() || "https://i.pravatar.cc/150";
  const photo = document.getElementById("photo")?.value.trim() || "https://loremflickr.com/640/480/people";
  const isAdmin = document.getElementById("admin").value === "true";

  let hasError = false;

  if (!nameRegex.test(nom)) {
    markInput("nom", false, "nomError", "Enter a valid last name (letters only, 2+ chars)");
    hasError = true;
  } else {
    markInput("nom", true);
  }

  if (!ageInput || isNaN(Number(ageInput)) || Number(ageInput) < 1 || Number(ageInput) > 120) {
    markInput("age", false, "ageError", "Enter a valid age (1–120)");
    hasError = true;
  } else {
    markInput("age", true);
  }

  if (!pseudoRegex.test(pseudo)) {
    markInput("pseudo", false, "pseudoError", "3+ chars: letters, numbers, underscores only");
    hasError = true;
  } else {
    markInput("pseudo", true);
  }

  if (!emailRegex.test(email)) {
    markInput("email", false, "emailError", "Enter a valid email address");
    hasError = true;
  } else {
    markInput("email", true);
  }

  if (!passwordRegex.test(MotDePasse)) {
    markInput("MotDePasse", false, "passError", "8+ chars with uppercase, lowercase, number & symbol");
    hasError = true;
  } else {
    markInput("MotDePasse", true);
  }

  if (MotDePasseCon !== MotDePasse) {
    markInput("MotDePasseConfirmation", false, "confirmPassError", "Passwords do not match");
    hasError = true;
  } else if (MotDePasse) {
    markInput("MotDePasseConfirmation", true);
  }

  if (hasError) {
    showAlert("Please fix the errors above before continuing.", "error");
    return;
  }

  setLoading(true);

  const user = {
    nom, prenom,
    age: Number(ageInput),
    admin: isAdmin,
    MotDePasse,
    pseudo, couleur, Devise, Pays, avatar, email, photo
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Server error");
    }

    localStorage.setItem("registeredUser", JSON.stringify(data));
    showAlert("Account created successfully! Redirecting to login…", "success");
    setTimeout(() => { window.location.href = "login.html"; }, 1500);

  } catch (err) {
    setLoading(false);
    showAlert("Could not create account. Please try again.", "error");
    console.error(err);
  }
});
