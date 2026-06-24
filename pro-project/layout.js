// ========================
// LAYOUT.JS — Dashboard
// ========================
const API_BASE_URL = "https://69ecc98baf4ff533142b610f.mockapi.io/Stagiaire";

// ========================
// SESSION
// ========================
const getCurrentUser = () => {
  try {
    const data = sessionStorage.getItem("user");
    return data ? JSON.parse(data) : null;
  } catch { return null; }
};

const requireAuth = () => {
  const user = getCurrentUser();
  if (!user) window.location.href = "login.html";
  return user;
};

const logout = () => {
  sessionStorage.clear();
  window.location.href = "login.html";
};

// ========================
// TOAST NOTIFICATIONS
// ========================
let toastTimer;
const toast = (message, type = "success") => {
  const el = document.getElementById("toast");
  clearTimeout(toastTimer);
  el.textContent = message;
  el.className = `show ${type}`;
  toastTimer = setTimeout(() => { el.className = ""; }, 3000);
};

// ========================
// API HELPER
// ========================
const fetchAPI = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

// ========================
// NAVIGATION CONFIG
// ========================
const navConfig = {
  admin: [
    { id: "home",          label: "Dashboard",     icon: iconHome() },
    { id: "profile",       label: "My Profile",    icon: iconUser() },
    { id: "users",         label: "Users",         icon: iconUsers() },
    { id: "addUser",       label: "Add User",      icon: iconPlus() },
    { id: "adminRequests", label: "Requests",      icon: iconClipboard() }
  ],
  user: [
    { id: "home",         label: "Dashboard",      icon: iconHome() },
    { id: "profile",      label: "My Profile",     icon: iconUser() },
    { id: "requests",     label: "My Requests",    icon: iconClipboard() },
    { id: "addRequest",   label: "New Request",    icon: iconPlus() }
  ]
};

// ========================
// INIT
// ========================
document.addEventListener("DOMContentLoaded", () => {
  const user = requireAuth();
  if (!user) return;

  // Set user info
  const avatarSrc = user.photo || "https://i.pravatar.cc/80";
  document.getElementById("sidebarAvatar").src = avatarSrc;
  document.getElementById("topbarAvatar").src = avatarSrc;
  document.getElementById("sidebarName").textContent = `${user.prenom} ${user.nom}`;
  document.getElementById("sidebarRole").textContent = user.admin ? "Administrator" : "User";
  document.getElementById("topbarName").textContent = `${user.prenom} ${user.nom}`;

  // Apply user color
  if (user.couleur) {
    document.documentElement.style.setProperty("--primary", user.couleur);
  }

  buildNav(user);
  setupSidebar();
  document.getElementById("logoutBtn").addEventListener("click", logout);
  showPage("home");
});

// ========================
// SIDEBAR TOGGLE
// ========================
const setupSidebar = () => {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const hamburger = document.getElementById("hamburger");

  const toggleSidebar = () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("show");
  };

  hamburger.addEventListener("click", toggleSidebar);
  overlay.addEventListener("click", toggleSidebar);
};

const closeSidebar = () => {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarOverlay").classList.remove("show");
};

// ========================
// NAVIGATION BUILD
// ========================
const buildNav = (user) => {
  const nav = document.getElementById("sidebarNav");
  const items = user.admin ? navConfig.admin : navConfig.user;

  nav.innerHTML = `<div class="nav-section-label">Menu</div>` +
    items.map(item => `
      <button class="nav-item" data-page="${item.id}">
        ${item.icon} ${item.label}
      </button>
    `).join("");

  nav.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      showPage(btn.dataset.page);
      closeSidebar();
    });
  });
};

const setActiveNav = (page) => {
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });
};

// ========================
// PAGE ROUTING
// ========================
window.showPage = async (page) => {
  setActiveNav(page);
  const user = getCurrentUser();
  if (!user) return;

  const titles = {
    home: "Dashboard", profile: "My Profile", users: "Users",
    addUser: "Add User", adminRequests: "All Requests",
    requests: "My Requests", addRequest: "New Request"
  };

  document.getElementById("pageTitle").textContent = titles[page] || "Dashboard";

  const routes = {
    home:          () => renderHome(user),
    profile:       () => renderProfile(user),
    users:         () => renderUsers(),
    addUser:       () => renderAddUser(),
    adminRequests: () => renderAllRequests(),
    requests:      () => renderMyRequests(),
    addRequest:    () => renderAddRequest()
  };

  if (routes[page]) {
    await routes[page]();
  } else {
    setContent(`<div class="alert alert-error">Page not found.</div>`);
  }
};

// ========================
// CONTENT HELPER
// ========================
const setContent = (html) => {
  document.getElementById("content").innerHTML = html;
};

const loading = () => `
  <div class="loading-state">
    <div class="spinner"></div>
    <p>Loading…</p>
  </div>
`;

// ========================
// HOME
// ========================
const renderHome = async (user) => {
  setContent(loading());
  let users = [], requests = [];
  try {
    const all = await fetchAPI(API_BASE_URL);
    users = all.filter(u => u.nom); // rough filter
    requests = all.filter(r => r.titre);
  } catch {}

  const pending = requests.filter(r => r.status === "pending").length;

  setContent(`
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">👥</div>
        <div>
          <div class="stat-value">${users.length}</div>
          <div class="stat-label">Total Users</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">📋</div>
        <div>
          <div class="stat-value">${requests.length}</div>
          <div class="stat-label">Total Requests</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">✅</div>
        <div>
          <div class="stat-value">${requests.filter(r=>r.status==='approved').length}</div>
          <div class="stat-label">Approved</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red">⏳</div>
        <div>
          <div class="stat-value">${pending}</div>
          <div class="stat-label">Pending</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Welcome back, ${user.prenom}! 👋</div>
      <div class="card-sub">
        You're signed in as <strong>${user.admin ? 'Administrator' : 'User'}</strong>.
        Use the sidebar to navigate through the dashboard.
      </div>
    </div>
  `);
};

// ========================
// PROFILE
// ========================
const renderProfile = (user) => {
  setContent(`
    <div class="profile-card">
      <div class="profile-banner"></div>
      <div class="profile-body">
        <div class="profile-avatar-wrap">
          <img class="profile-avatar"
               src="${user.photo || 'https://i.pravatar.cc/80'}"
               alt="avatar"
               onerror="this.src='https://i.pravatar.cc/80'">
        </div>
        <div class="profile-name">${user.prenom} ${user.nom}</div>
        <div class="profile-role">
          <span class="badge ${user.admin ? 'badge-admin' : 'badge-user'}">
            ${user.admin ? '🛡 Administrator' : '👤 User'}
          </span>
        </div>

        <div class="profile-grid">
          <div class="profile-field">
            <div class="profile-field-label">Email</div>
            <div class="profile-field-value">${user.email || '—'}</div>
          </div>
          <div class="profile-field">
            <div class="profile-field-label">Username</div>
            <div class="profile-field-value">${user.pseudo || '—'}</div>
          </div>
          <div class="profile-field">
            <div class="profile-field-label">Age</div>
            <div class="profile-field-value">${user.age || '—'}</div>
          </div>
          <div class="profile-field">
            <div class="profile-field-label">Country</div>
            <div class="profile-field-value">${user.Pays || '—'}</div>
          </div>
          ${user.Devise ? `
          <div class="profile-field" style="grid-column: 1/-1;">
            <div class="profile-field-label">Motto</div>
            <div class="profile-field-value">"${user.Devise}"</div>
          </div>` : ''}
        </div>
      </div>
    </div>
  `);
};

// ========================
// USERS LIST
// ========================
const renderUsers = async () => {
  setContent(`
    <div class="page-header">
      <h2>Users</h2>
    </div>
    <div class="table-wrapper">
      <div class="table-toolbar">
        <div class="table-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="userSearch" placeholder="Search users…">
        </div>
      </div>
      <div class="table-scroll" id="usersTableWrap">
        ${loading()}
      </div>
    </div>
  `);

  try {
    const users = await fetchAPI(API_BASE_URL);
    renderUserTable(users);

    document.getElementById("userSearch").addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = users.filter(u =>
        `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(q)
      );
      renderUserTable(filtered);
    });
  } catch (err) {
    document.getElementById("usersTableWrap").innerHTML =
      `<div class="alert alert-error" style="margin:1rem;">Failed to load users.</div>`;
  }
};

const renderUserTable = (users) => {
  if (!users.length) {
    document.getElementById("usersTableWrap").innerHTML = `
      <div class="empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <p>No users found.</p>
      </div>`;
    return;
  }

  document.getElementById("usersTableWrap").innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>User</th>
          <th>Role</th>
          <th>Age</th>
          <th>Country</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(u => `
          <tr>
            <td>
              <div class="user-cell">
                <img class="user-cell-avatar"
                     src="${u.photo || 'https://i.pravatar.cc/34?u='+u.id}"
                     alt=""
                     onerror="this.src='https://i.pravatar.cc/34'">
                <div>
                  <div class="user-cell-name">${u.nom || ''} ${u.prenom || ''}</div>
                  <div class="user-cell-email">${u.email || ''}</div>
                </div>
              </div>
            </td>
            <td><span class="badge ${u.admin ? 'badge-admin' : 'badge-user'}">${u.admin ? 'Admin' : 'User'}</span></td>
            <td>${u.age || '—'}</td>
            <td>${u.Pays || '—'}</td>
            <td>
              <div class="action-group">
                <button class="icon-btn primary" title="View" onclick="window.viewUser('${u.id}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="icon-btn" title="Edit" onclick="window.editUser('${u.id}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="icon-btn danger" title="Delete" onclick="window.deleteUser('${u.id}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                </button>
              </div>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
};

// ========================
// VIEW USER
// ========================
window.viewUser = async (id) => {
  setContent(loading());
  try {
    const u = await fetchAPI(`${API_BASE_URL}/${id}`);
    setContent(`
      <div class="page-header">
        <h2>User Details</h2>
        <button class="btn btn-ghost" onclick="showPage('users')">← Back</button>
      </div>
      <div class="profile-card">
        <div class="profile-banner"></div>
        <div class="profile-body">
          <div class="profile-avatar-wrap">
            <img class="profile-avatar" src="${u.photo || 'https://i.pravatar.cc/80?u='+u.id}" onerror="this.src='https://i.pravatar.cc/80'">
          </div>
          <div class="profile-name">${u.prenom || ''} ${u.nom || ''}</div>
          <div class="profile-role">
            <span class="badge ${u.admin ? 'badge-admin' : 'badge-user'}">${u.admin ? '🛡 Administrator' : '👤 User'}</span>
          </div>
          <div class="profile-grid">
            <div class="profile-field"><div class="profile-field-label">Email</div><div class="profile-field-value">${u.email || '—'}</div></div>
            <div class="profile-field"><div class="profile-field-label">Username</div><div class="profile-field-value">${u.pseudo || '—'}</div></div>
            <div class="profile-field"><div class="profile-field-label">Age</div><div class="profile-field-value">${u.age || '—'}</div></div>
            <div class="profile-field"><div class="profile-field-label">Country</div><div class="profile-field-value">${u.Pays || '—'}</div></div>
            <div class="profile-field"><div class="profile-field-label">ID</div><div class="profile-field-value">#${u.id}</div></div>
          </div>
          <div style="margin-top:1rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button class="btn btn-primary" onclick="window.editUser('${u.id}')">Edit User</button>
            <button class="btn btn-danger" onclick="window.deleteUser('${u.id}')">Delete User</button>
          </div>
        </div>
      </div>
    `);
  } catch {
    toast("Failed to load user details.", "error");
    showPage("users");
  }
};

// ========================
// EDIT USER
// ========================
window.editUser = async (id) => {
  setContent(loading());
  try {
    const u = await fetchAPI(`${API_BASE_URL}/${id}`);
    setContent(`
      <div class="page-header">
        <h2>Edit User</h2>
        <button class="btn btn-ghost" onclick="showPage('users')">← Back</button>
      </div>
      <div class="content-form">
        <form id="editForm">
          <div class="form-row-2col">
            <div class="form-group"><label>Last name</label><input type="text" id="nom" value="${u.nom || ''}"></div>
            <div class="form-group"><label>First name</label><input type="text" id="prenom" value="${u.prenom || ''}"></div>
          </div>
          <div class="form-group"><label>Email</label><input type="email" id="email" value="${u.email || ''}"></div>
          <div class="form-row-2col">
            <div class="form-group"><label>Age</label><input type="number" id="age" value="${u.age || ''}"></div>
            <div class="form-group"><label>Role</label>
              <select id="admin">
                <option value="false" ${!u.admin ? 'selected' : ''}>User</option>
                <option value="true"  ${u.admin  ? 'selected' : ''}>Administrator</option>
              </select>
            </div>
          </div>
          <div style="display:flex;gap:0.5rem;margin-top:0.5rem;">
            <button type="submit" class="btn btn-primary">Save changes</button>
            <button type="button" class="btn btn-ghost" onclick="showPage('users')">Cancel</button>
          </div>
        </form>
      </div>
    `);

    document.getElementById("editForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const updated = {
        nom:    document.getElementById("nom").value,
        prenom: document.getElementById("prenom").value,
        email:  document.getElementById("email").value,
        age:    Number(document.getElementById("age").value),
        admin:  document.getElementById("admin").value === "true"
      };
      try {
        await fetchAPI(`${API_BASE_URL}/${id}`, { method: "PUT", body: JSON.stringify(updated) });
        toast("User updated successfully.");
        setTimeout(() => showPage("users"), 800);
      } catch {
        toast("Failed to update user.", "error");
      }
    });

  } catch {
    toast("Failed to load user.", "error");
    showPage("users");
  }
};

// ========================
// DELETE USER
// ========================
window.deleteUser = async (id) => {
  if (!confirm("Delete this user? This action cannot be undone.")) return;
  try {
    await fetchAPI(`${API_BASE_URL}/${id}`, { method: "DELETE" });
    toast("User deleted.");
    showPage("users");
  } catch {
    toast("Failed to delete user.", "error");
  }
};

// ========================
// ADD USER (ADMIN)
// ========================
const renderAddUser = () => {
  setContent(`
    <div class="page-header"><h2>Add User</h2></div>
    <div class="content-form">
      <form id="addUserForm">
        <div class="form-row-2col">
          <div class="form-group"><label>Last name</label><input type="text" id="nom" required></div>
          <div class="form-group"><label>First name</label><input type="text" id="prenom" required></div>
        </div>
        <div class="form-row-2col">
          <div class="form-group"><label>Age</label><input type="number" id="age" required></div>
          <div class="form-group"><label>Username</label><input type="text" id="pseudo" required></div>
        </div>
        <div class="form-group"><label>Email</label><input type="email" id="email" required></div>
        <div class="form-group"><label>Password</label><input type="password" id="MotDePasse" required></div>
        <div class="form-row-2col">
          <div class="form-group"><label>Accent color</label><input type="color" id="couleur" value="#4a6cf7"></div>
          <div class="form-group"><label>Photo URL</label><input type="text" id="photo" placeholder="https://…"></div>
        </div>
        <div style="display:flex;gap:0.5rem;margin-top:0.5rem;">
          <button type="submit" class="btn btn-primary">Add user</button>
          <button type="button" class="btn btn-ghost" onclick="showPage('users')">Cancel</button>
        </div>
      </form>
    </div>
  `);

  document.getElementById("addUserForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = {
      nom:       document.getElementById("nom").value,
      prenom:    document.getElementById("prenom").value,
      age:       Number(document.getElementById("age").value),
      pseudo:    document.getElementById("pseudo").value,
      email:     document.getElementById("email").value,
      MotDePasse: document.getElementById("MotDePasse").value,
      couleur:   document.getElementById("couleur").value,
      photo:     document.getElementById("photo").value || "https://loremflickr.com/640/480/people",
      admin: false
    };

    try {
      await fetchAPI(API_BASE_URL, { method: "POST", body: JSON.stringify(user) });
      toast("User added successfully.");
      setTimeout(() => showPage("users"), 800);
    } catch {
      toast("Failed to add user.", "error");
    }
  });
};

// ========================
// MY REQUESTS (USER)
// ========================
const renderMyRequests = async () => {
  const user = getCurrentUser();
  setContent(`
    <div class="page-header">
      <h2>My Requests</h2>
      <button class="btn btn-primary" onclick="showPage('addRequest')">+ New Request</button>
    </div>
    <div id="reqList">${loading()}</div>
  `);

  try {
    const all = await fetchAPI(API_BASE_URL);
    const myReqs = all.filter(r => r.userId == user.id && r.titre);
    const container = document.getElementById("reqList");

    if (!myReqs.length) {
      container.innerHTML = `
        <div class="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <p>No requests yet. <a href="#" onclick="showPage('addRequest'); return false;">Create one</a>.</p>
        </div>`;
      return;
    }

    container.innerHTML = myReqs.map(r => `
      <div class="card">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;flex-wrap:wrap;">
          <div>
            <div class="card-title">📌 ${r.titre || 'Untitled'}</div>
            <div class="card-sub" style="margin-top:0.3rem;">${r.description || 'No description'}</div>
            ${r.createdAt ? `<div style="font-size:0.75rem;color:var(--gray-400);margin-top:0.5rem;">${new Date(r.createdAt).toLocaleDateString()}</div>` : ''}
          </div>
          <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
            <span class="badge badge-${r.status || 'pending'}">${statusLabel(r.status)}</span>
            ${r.status === 'pending'
              ? `<button class="btn btn-ghost" style="font-size:0.8rem;padding:0.35rem 0.75rem;" onclick="window.cancelRequest('${r.id}')">Cancel</button>`
              : ''}
          </div>
        </div>
      </div>
    `).join("");

  } catch {
    document.getElementById("reqList").innerHTML = `<div class="alert alert-error">Failed to load requests.</div>`;
  }
};

window.cancelRequest = async (id) => {
  if (!confirm("Cancel this request?")) return;
  try {
    await fetchAPI(`${API_BASE_URL}/${id}`, { method: "DELETE" });
    toast("Request cancelled.");
    renderMyRequests();
  } catch {
    toast("Failed to cancel request.", "error");
  }
};

// ========================
// ADD REQUEST
// ========================
const renderAddRequest = () => {
  setContent(`
    <div class="page-header"><h2>New Request</h2></div>
    <div class="content-form">
      <form id="reqForm">
        <div class="form-group"><label>Title</label><input type="text" id="titre" required placeholder="Request title"></div>
        <div class="form-group"><label>Description</label><textarea id="desc" rows="4" placeholder="Describe your request…"></textarea></div>
        <div style="display:flex;gap:0.5rem;margin-top:0.5rem;">
          <button type="submit" class="btn btn-primary">Submit request</button>
          <button type="button" class="btn btn-ghost" onclick="showPage('requests')">Cancel</button>
        </div>
      </form>
    </div>
  `);

  document.getElementById("reqForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    const request = {
      userId: user.id,
      titre: document.getElementById("titre").value,
      description: document.getElementById("desc").value,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    try {
      await fetchAPI(API_BASE_URL, { method: "POST", body: JSON.stringify(request) });
      toast("Request submitted.");
      setTimeout(() => showPage("requests"), 800);
    } catch {
      toast("Failed to submit request.", "error");
    }
  });
};

// ========================
// ALL REQUESTS (ADMIN)
// ========================
const renderAllRequests = async () => {
  setContent(`
    <div class="page-header"><h2>All Requests</h2></div>
    <div id="reqList">${loading()}</div>
  `);

  try {
    const all = await fetchAPI(API_BASE_URL);
    const reqs = all.filter(r => r.titre);
    const container = document.getElementById("reqList");

    if (!reqs.length) {
      container.innerHTML = `<div class="empty-state"><p>No requests found.</p></div>`;
      return;
    }

    container.innerHTML = reqs.map(r => `
      <div class="card">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;flex-wrap:wrap;">
          <div style="flex:1;min-width:200px;">
            <div class="card-title">📌 ${r.titre || 'Untitled'}</div>
            <div class="card-sub" style="margin-top:0.3rem;">${r.description || 'No description'}</div>
            <div style="font-size:0.75rem;color:var(--gray-400);margin-top:0.5rem;">User #${r.userId || '—'}</div>
          </div>
          <div>
            <span class="badge badge-${r.status || 'pending'}">${statusLabel(r.status)}</span>
          </div>
        </div>
        <div style="display:flex;gap:0.5rem;margin-top:1rem;flex-wrap:wrap;">
          <button class="btn btn-success" onclick="window.updateReqStatus('${r.id}', 'approved')" ${r.status==='approved'?'disabled':''}>✅ Approve</button>
          <button class="btn btn-danger"  onclick="window.updateReqStatus('${r.id}', 'rejected')" ${r.status==='rejected'?'disabled':''}>❌ Reject</button>
          <button class="btn btn-ghost"   onclick="window.deleteRequest('${r.id}')">🗑 Delete</button>
        </div>
      </div>
    `).join("");

  } catch {
    document.getElementById("reqList").innerHTML = `<div class="alert alert-error">Failed to load requests.</div>`;
  }
};

window.updateReqStatus = async (id, status) => {
  try {
    await fetchAPI(`${API_BASE_URL}/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
    toast(`Request ${status === 'approved' ? 'approved' : 'rejected'}.`);
    renderAllRequests();
  } catch {
    toast("Failed to update status.", "error");
  }
};

window.deleteRequest = async (id) => {
  if (!confirm("Delete this request?")) return;
  try {
    await fetchAPI(`${API_BASE_URL}/${id}`, { method: "DELETE" });
    toast("Request deleted.");
    renderAllRequests();
  } catch {
    toast("Failed to delete.", "error");
  }
};

// ========================
// HELPERS
// ========================
const statusLabel = (s) =>
  ({ pending: '⏳ Pending', approved: '✅ Approved', rejected: '❌ Rejected' })[s] || '⏳ Pending';

// SVG Icons
function iconHome() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
}
function iconUser() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
}
function iconUsers() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
}
function iconPlus() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;
}
function iconClipboard() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>`;
}
