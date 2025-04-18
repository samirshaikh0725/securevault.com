// Utility Shortcuts
const getById = id => document.getElementById(id);

// Initialization
let userDatabase = JSON.parse(localStorage.getItem("userDatabase")) || {};
let fileStorage = JSON.parse(localStorage.getItem("fileStorage")) || {};
let currentUserId = parseInt(localStorage.getItem("currentUserId")) || 1;
let loggedInUser = null;
let isAdmin = false;

const adminCredentials = { username: "Shaikh_Sahaab", password: "SamirShaikh" };

function saveData() {
  localStorage.setItem("userDatabase", JSON.stringify(userDatabase));
  localStorage.setItem("fileStorage", JSON.stringify(fileStorage));
  localStorage.setItem("currentUserId", currentUserId);
}

function padId(id) {
  return id.toString().padStart(3, '0');
}

function createAccount() {
  const password = getById('create-password').value;
  const name = getById('create-name').value;
  const age = getById('create-age').value;

  if (!password || !name || !age) return alert("All fields required!");

  let id;
  for (let i = 1; i < currentUserId; i++) {
    const testId = padId(i);
    if (!userDatabase[testId]) {
      id = testId;
      break;
    }
  }
  if (!id) id = padId(currentUserId++);

  userDatabase[id] = { password, name, age, createdAt: new Date().toLocaleString() };
  saveData();
  alert(`Account created! Your User ID is ${id}`);
  showLoginForm();
}

function userLogin() {
  const id = getById("login-id").value;
  const password = getById("login-password").value;
  const remember = getById("remember-me").checked;

  if (userDatabase[id] && userDatabase[id].password === password) {
    loggedInUser = id;
    sessionStorage.setItem("loggedInUser", id);
    if (remember) localStorage.setItem("rememberedUser", id);
    showUserDashboard(id);
    showSecureSafe();
    showToast("Login successful ✅");
  } else {
    showToast("Invalid credentials ❌");
  }
}

function logoutUser() {
  sessionStorage.removeItem("loggedInUser");
  localStorage.removeItem("rememberedUser");
  loggedInUser = null;
  getById("user-dashboard").style.display = "none";
  getById("user-login-section").style.display = "block";
  getById("user-profile").style.display = "none";
  location.href = location.pathname;
  goHome();
}

function adminLogin() {
  const username = getById("admin-username").value;
  const password = getById("admin-password").value;
  const remember = getById("admin-remember-me").checked;

  if (username === adminCredentials.username && password === adminCredentials.password) {
    isAdmin = true;
    document.getElementById('admin-login-section').style.display = 'none';
    document.getElementById('admin-profile').style.display = 'block';
    document.getElementById('admin-link').style.display = 'none';
    document.getElementById('user-profile').style.display = 'inline';
    document.getElementById('user-profile').textContent = "Admin";
    sessionStorage.setItem("adminLoggedIn", "true");
    if (remember) localStorage.setItem("adminRemembered", "true");
    showAdminDashboard();
    showToast("Welcome Admin 👑");
  } else {
    showToast("Invalid Admin Credentials ❌");
  }
}

function logoutAdmin() {
  isAdmin = false;
  document.getElementById('admin-profile').style.display = 'none';
  document.getElementById('user-profile').style.display = 'none';
  document.getElementById('admin-username').value = '';
  document.getElementById('admin-password').value = '';
  document.getElementById('admin-output').innerHTML = '';
  sessionStorage.removeItem("adminLoggedIn");
  localStorage.removeItem("adminRemembered");
  hideAllSections();
  document.getElementById("admin-login-section").style.display = "block";
  showToast("Admin logged out");
  goHome();
}

function uploadFile() {
  const fileInput = getById('file-upload');
  const password = getById('file-password').value;

  if (!fileInput.files.length) return displayFileStatus("No file selected.");
  if (password.length !== 4 || isNaN(password)) return displayFileStatus("Enter a 4-digit password.");

  const userFiles = fileStorage[loggedInUser] || [];

  Array.from(fileInput.files).forEach(file => {
    if (!file.name.endsWith(".txt")) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      userFiles.push({ name: file.name, content: e.target.result, password });
      fileStorage[loggedInUser] = userFiles;
      saveData();
      displayFileStatus("File uploaded and locked.");
      showUploadSuccess();
      updateUserFileInfo();
    };
    reader.readAsText(file);
  });
}

function downloadFile(index) {
  const files = fileStorage[loggedInUser] || [];
  const data = files[index];
  if (!data) return alert("No file found at this index.");
  const enteredPassword = prompt("Enter 4-digit password to download:");
  if (enteredPassword !== data.password) return alert("Incorrect password.");

  const blob = new Blob([data.content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = data.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  const logs = JSON.parse(localStorage.getItem("downloadLogs")) || [];
  logs.push({ id: loggedInUser, file: data.name, time: new Date().toLocaleString() });
  localStorage.setItem("downloadLogs", JSON.stringify(logs));
}


function updateUserFileInfo() {
  const fileInfo = getById('user-file-info');
  const files = fileStorage[loggedInUser] || [];
  if (files.length === 0) return fileInfo.textContent = 'No files uploaded.';

  fileInfo.innerHTML = files.map((file, i) =>
    `File ${i + 1}: ${file.name}
     <button onclick="downloadFile(${i})">Download</button><br/>
     <pre class="preview">${file.content.slice(0, 100)}...</pre><hr/>`
  ).join("");
}

function showUserDashboard(id) {
  const user = userDatabase[id];
  loggedInUser = id;
  getById('user-dashboard').style.display = 'block';
  getById('logged-in-user-name').textContent = user.name;
  getById('logged-in-user-id').textContent = id;
  getById('logged-in-user-age').textContent = user.age;
  getById('user-profile').style.display = 'inline';
  getById('user-profile').textContent = `User: ${id}`;
  updateUserFileInfo();
}

function editUser() {
  const newName = prompt("Enter new name:", userDatabase[loggedInUser].name);
  const newAge = prompt("Enter new age:", userDatabase[loggedInUser].age);
  if (newName && newAge) {
    userDatabase[loggedInUser].name = newName;
    userDatabase[loggedInUser].age = newAge;
    saveData();
    alert("User info updated.");
    getById('logged-in-user-name').textContent = newName;
    getById('logged-in-user-age').textContent = newAge;
  }
}

function deleteUser() {
  const confirmPass = prompt("Enter your password to confirm deletion:");
  if (confirmPass === userDatabase[loggedInUser].password) {
    delete userDatabase[loggedInUser];
    delete fileStorage[loggedInUser];
    saveData();
    logoutUser();
    alert("User deleted.");
  } else {
    alert("Incorrect password. Account not deleted.");
  }
}

function viewDownloadLogs(page = 1, perPage = 5) {
  const logs = JSON.parse(localStorage.getItem("downloadLogs")) || [];
  const out = getById("admin-output");
  const totalPages = Math.ceil(logs.length / perPage);
  const filtered = logs.slice((page - 1) * perPage, page * perPage);

  out.innerHTML = `<h3>Download Logs (Page ${page} of ${totalPages}):</h3>`;
  if (logs.length === 0) return out.innerHTML += "<p>No logs found.</p>";

  filtered.forEach(log => {
    out.innerHTML += `User ID: ${log.id}, File: ${log.file}, Time: ${log.time}<br/>`;
  });

  if (totalPages > 1) {
    out.innerHTML += `<div style="margin-top:10px;">`;
    for (let i = 1; i <= totalPages; i++) {
      out.innerHTML += `<button onclick="viewDownloadLogs(${i})">${i}</button> `;
    }
    out.innerHTML += `</div>`;
  }
}
function filterLogs() {
  const logs = JSON.parse(localStorage.getItem("downloadLogs")) || [];
  const userId = prompt("Enter User ID to filter (leave blank to skip):");
  const date = prompt("Enter date (YYYY-MM-DD) to filter (leave blank to skip):");
  const out = getById("admin-output");

  const filtered = logs.filter(log => {
    const matchesUser = !userId || log.id === userId;
    const matchesDate = !date || log.time.startsWith(date);
    return matchesUser && matchesDate;
  });

  out.innerHTML = "<h3>Filtered Logs:</h3>";
  if (filtered.length === 0) return out.innerHTML += "<p>No logs found.</p>";

  filtered.forEach(log => {
    out.innerHTML += `User ID: ${log.id}, File: ${log.file}, Time: ${log.time}<br/>`;
  });
}

function exportLogs() {
  const logs = JSON.parse(localStorage.getItem("downloadLogs")) || [];
  if (logs.length === 0) return alert("No logs to export.");

  const logText = logs.map(log =>
    `User ID: ${log.id}, File: ${log.file}, Time: ${log.time}`
  ).join("\n");

  const blob = new Blob([logText], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "download_logs.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}



function viewAllFiles() {
  const out = getById('admin-output');
  out.innerHTML = "<h3>User Files:</h3>";
  for (const id in fileStorage) {
    const files = fileStorage[id];
    files.forEach(file => {
      out.innerHTML += `User ID: ${id}, File: ${file.name}<br/>`;
    });
  }
}

function exportUserData() {
  const blob = new Blob([JSON.stringify(userDatabase, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "user_data.json";
  a.click();
}

function searchUser() {
  const id = getById('search-id').value;
  const result = getById('search-result');

  if (userDatabase[id]) {
    const user = userDatabase[id];
    result.innerHTML = `User Found: Name: ${user.name}, Age: ${user.age}`;
  } else {
    result.innerHTML = "User not found.";
  }
}

function showCreateAccountForm() {
  hideAllSections();
  getById('create-account-section').style.display = 'block';
}

function showLoginForm() {
  hideAllSections();
  getById('user-login-section').style.display = 'block';
}

function showAdminLogin() {
  hideAllSections();
  getById('admin-login-section').style.display = 'block';
}

function showSearchSection() {
  getById('search-section').style.display = 'block';
}

function showSecureSafe() {
  if (loggedInUser) {
    hideAllSections();
    getById('user-dashboard').style.display = 'block';
  } else {
    alert("Login first to access secure safe.");
  }
}

function showUploadSuccess() {
  const popup = getById('upload-success');
  popup.style.display = 'block';
  setTimeout(() => popup.style.display = 'none', 2500);
}

function showOnly(id) {
  const sections = ["home", "register", "login", "admin", "secure-safe"];
  sections.forEach(sec => getById(sec).style.display = "none");
  getById(id).style.display = "block";

  // Update nav active state
  document.querySelectorAll("nav a").forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("data-id") === id) {
      link.classList.add("active");
    }
  });
}


function resetAllData() {
  if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
    localStorage.clear();
    location.reload();
  }
}

function goHome() {
  hideAllSections();
  const params = new URLSearchParams(window.location.search);
  const show = params.get("show");
  if (!show) getById('create-account-section').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showAbout() {
  hideAllSections();
  getById('about-section').style.display = 'block';
}

function hideAllSections() {
  [
    'user-login-section', 'create-account-section', 'admin-login-section',
    'admin-profile', 'user-dashboard', 'search-section', 'about-section'
  ].forEach(id => getById(id).style.display = 'none');
}

function displayFileStatus(msg) {
  getById('file-status').textContent = msg;
}

function showToast(message) {
  const toast = getById("toast");
  toast.innerText = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const show = params.get("show");

  if (show === "login") showLoginForm();
  else if (show === "signup") showCreateAccountForm();
  else if (show === "admin") showAdminLogin();
  else getById('create-account-section').style.display = 'block';

  const rememberedUser = localStorage.getItem("rememberedUser");
  const adminRemembered = localStorage.getItem("adminRemembered");

  if (adminRemembered) {
    sessionStorage.setItem("adminLoggedIn", true);
    isAdmin = true;
    showAdminDashboard();
    showToast("Welcome back Admin 👑");
  } else if (rememberedUser && userDatabase[rememberedUser]) {
    sessionStorage.setItem("loggedInUser", rememberedUser);
    loggedInUser = rememberedUser;
    showUserDashboard(rememberedUser);
    showSecureSafe();
    showToast("Welcome back! You were remembered ✅");
  }
});
