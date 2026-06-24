// ========================
// AUTH.JS — Login Logic
// ========================
const API_URL = "https://69ecc98baf4ff533142b610f.mockapi.io/Stagiaire";

const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const alertBox = document.getElementById("alertBox");

let attempts = 0;
let lockTimer = null;

// ---- Password toggle ----
document.querySelectorAll(".toggle-password").forEach(btn => {
  btn.addEventListener("click", () => {
    const input = btn.closest(".input-wrapper").querySelector("input");
    const isText = input.type === "text";
    input.type = isText ? "password" : "text";
    btn.querySelector("svg").style.opacity = isText ? "1" : "0.5";
  });
});

// ---- Remember Me pre-fill ----
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("rememberUser");
  if (saved) {
    try {
      const { email } = JSON.parse(saved);
      document.getElementById("email").value = email;
      document.getElementById("remember").checked = true;
    } catch {}
  }
});

// ---- Helpers ----
function showAlert(message, type = "error") {
  alertBox.textContent = message;
  alertBox.className = `alert-box ${type}`;
  alertBox.style.display = "block";
}

function hideAlert() {
  alertBox.style.display = "none";
}

function setLoading(loading) {
  loginBtn.disabled = loading;
  loginBtn.querySelector(".btn-text").style.display = loading ? "none" : "inline";
  loginBtn.querySelector(".btn-spinner").style.display = loading ? "flex" : "none";
}

function markField(id, valid) {
  const input = document.getElementById(id);
  if (!input) return;
  input.classList.toggle("error", !valid);
  input.classList.toggle("valid", valid);
}

// ---- Lockout countdown ----
function startLockout(seconds) {
  loginBtn.disabled = true;
  attempts = 0;

  const tick = () => {
    showAlert(`Too many failed attempts. Try again in ${seconds}s`, "warning");
    seconds--;
    if (seconds < 0) {
      clearInterval(lockTimer);
      loginBtn.disabled = false;
      loginBtn.querySelector(".btn-text").textContent = "Sign in";
      hideAlert();
    }
  };
  tick();
  lockTimer = setInterval(tick, 1000);
}

// ---- Form submit ----
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideAlert();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const remember = document.getElementById("remember").checked;

  let valid = true;

  if (!email) {
    markField("email", false);
    valid = false;
  } else {
    markField("email", true);
  }

  if (!password) {
    markField("password", false);
    valid = false;
  } else {
    markField("password", true);
  }

  if (!valid) {
    showAlert("Please fill in all required fields.", "error");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch(API_URL);
    const users = await res.json();
    const user = users.find(u => u.email === email && u.MotDePasse === password);

    if (!user) {
      attempts++;
      markField("email", false);
      markField("password", false);

      if (attempts >= 3) {
        setLoading(false);
        startLockout(30);
      } else {
        setLoading(false);
        showAlert(`Incorrect email or password. ${3 - attempts} attempt${3 - attempts === 1 ? '' : 's'} remaining.`, "error");
      }
      return;
    }

    // Success
    markField("email", true);
    markField("password", true);
    showAlert("Signed in successfully! Redirecting…", "success");

    sessionStorage.setItem("user", JSON.stringify(user));

    if (remember) {
      localStorage.setItem("rememberUser", JSON.stringify({ email }));
    } else {
      localStorage.removeItem("rememberUser");
    }

    setTimeout(() => { window.location.href = "layout.html"; }, 800);

  } catch (err) {
    setLoading(false);
    showAlert("Network error. Please check your connection and try again.", "error");
    console.error(err);
  }
});
