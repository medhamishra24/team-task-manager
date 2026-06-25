const API_BASE = "http://localhost:5000/api";
const state = {
  token: null,
  user: null,
  tasks: [],
  stats: {},
  filters: { search: "", status: "all" },
  activeSection: "dashboard",
  currentDeleteTask: null,
};

const authScreen = document.getElementById("authScreen");
const appShell = document.getElementById("appShell");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const authTitle = document.getElementById("authTitle");
const authDescription = document.getElementById("authDescription");
const welcomeText = document.getElementById("welcomeText");
const userRoleText = document.getElementById("userRoleText");
const notificationsMenu = document.getElementById("notificationsMenu");
const toastContainer = document.getElementById("toastContainer");
const loaderOverlay = document.getElementById("loaderOverlay");
const statusFilter = document.getElementById("statusFilter");
const searchInput = document.getElementById("searchInput");
const taskList = document.getElementById("taskList");
const statsGrid = document.getElementById("statsGrid");
const recentList = document.getElementById("recentList");
const sectionButtons = document.querySelectorAll(".sidebar button[data-section]");
const taskModalBackdrop = document.getElementById("taskModal");
const confirmModalBackdrop = document.getElementById("confirmModal");
const taskForm = document.getElementById("taskForm");
const modalTitle = document.getElementById("modalTitle");
const themeToggle = document.getElementById("themeToggle");

const statusSelect = document.getElementById("statusSelect");
const searchInputMobile = document.getElementById("searchInputMobile");
const tasksTitle = document.getElementById("tasksTitle");

const currentUserName = document.getElementById("currentUserName");
const currentUserRole = document.getElementById("currentUserRole");

const taskTitleInput = document.getElementById("taskTitle");
const taskDescriptionInput = document.getElementById("taskDescription");
const taskDueInput = document.getElementById("taskDue");
const taskPriorityInput = document.getElementById("taskPriority");
const taskProjectInput = document.getElementById("taskProject");
const taskAssignInput = document.getElementById("taskAssign");
const saveTaskButton = document.getElementById("saveTaskButton");
const confirmTaskButton = document.getElementById("confirmTaskButton");
const closeTaskModalButton = document.getElementById("closeTaskModalButton");
const closeConfirmModalButton = document.getElementById("closeConfirmModalButton");

const authStorageKey = "taskManagerSession";

const showLoader = (show) => {
  loaderOverlay.classList.toggle("active", show);
};

const showToast = (message, type = "success") => {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3800);
};

const fetchJson = async (url, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
};

const saveSession = () => {
  if (state.token && state.user) {
    localStorage.setItem(authStorageKey, JSON.stringify({ token: state.token, user: state.user }));
  } else {
    localStorage.removeItem(authStorageKey);
  }
};

const logout = () => {
  state.token = null;
  state.user = null;
  state.tasks = [];
  saveSession();
  authScreen.classList.remove("page-hidden");
  appShell.classList.add("page-hidden");
  showToast("You have logged out.", "success");
};

const updateNavigation = () => {
  sectionButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.section === state.activeSection);
  });
};

const switchSection = (section) => {
  state.activeSection = section;
  document.getElementById(section).scrollIntoView({ behavior: "smooth", block: "start" });
  updateNavigation();
};

const renderStats = () => {
  const stats = state.stats || {};
  statsGrid.innerHTML = `
    <div class="stat-card">
      <h3>Total Tasks</h3>
      <p>${stats.total ?? 0}</p>
    </div>
    <div class="stat-card">
      <h3>Completed</h3>
      <p>${stats.completed ?? 0}</p>
    </div>
    <div class="stat-card">
      <h3>Pending</h3>
      <p>${stats.pending ?? 0}</p>
    </div>
    <div class="stat-card">
      <h3>Overdue</h3>
      <p>${stats.overdue ?? 0}</p>
    </div>
  `;
};

const renderRecentActivity = () => {
  const recent = state.stats?.recent || [];
  if (!recent.length) {
    recentList.innerHTML = `<p class="empty-state">No recent activity yet. Create a task to populate the board.</p>`;
    return;
  }

  recentList.innerHTML = recent
    .map((task) => {
      const statusLabel = task.status === "done" ? "Completed" : task.status === "in-progress" ? "In Progress" : "Pending";
      return `
        <div class="task-card">
          <div class="task-card-header">
            <div>
              <p class="task-card-title">${task.title}</p>
              <div class="task-row">
                <span class="task-badge ${task.status}">${statusLabel}</span>
                <span class="priority-badge ${task.priority}">${task.priority}</span>
              </div>
            </div>
            <span>${new Date(task.updatedAt).toLocaleDateString()}</span>
          </div>
          <p class="task-row">${task.project || "General"} • ${task.assignedTo === state.user.id ? "Assigned to you" : "Team task"}</p>
        </div>
      `;
    })
    .join("");
};

const renderTasks = () => {
  if (!state.tasks.length) {
    taskList.innerHTML = `
      <div class="empty-state">
        <h3>Task board is empty</h3>
        <p>Create your first task to see it appear here with due dates, priority, and status updates.</p>
      </div>
    `;
    return;
  }

  taskList.innerHTML = state.tasks
    .map((task) => {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      const overdue = dueDate && dueDate < new Date() && task.status !== "done";
      const statusLabel = task.status === "done" ? "Done" : task.status === "in-progress" ? "In Progress" : "Pending";
      const canUpdate = state.user.role === "admin" || task.assignedTo === state.user.id;
      const showDelete = state.user.role === "admin";
      const assignedText = task.assignedTo === state.user.id ? "You" : "Team";

      return `
        <div class="task-card ${overdue ? "overdue" : ""}">
          <div class="task-card-header">
            <div>
              <p class="task-card-title">${task.title}</p>
              <div class="task-row">
                <span class="task-badge ${task.status}">${statusLabel}</span>
                <span class="priority-badge ${task.priority}">${task.priority}</span>
                <span class="task-row">${assignedText}</span>
              </div>
            </div>
            <div class="task-actions">
              ${canUpdate ? `<button class="secondary-button" onclick="updateTaskStatus('${task._id}', '${task.status}')">${task.status === 'done' ? 'Reviewed' : task.status === 'in-progress' ? 'Mark Done' : 'Start'}</button>` : ""}
              ${showDelete ? `<button class="secondary-button" onclick="openConfirmModal('${task._id}', '${task.title}')">Delete</button>` : ""}
            </div>
          </div>
          <div class="task-details">
            <div class="task-row">${task.description || "No description"}</div>
            <div class="task-row">
              <span>${task.project || "General"}</span>
              <span>${dueDate ? dueDate.toLocaleDateString() : "No due date"}</span>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
};

const populateUserInfo = () => {
  welcomeText.textContent = `Welcome back, ${state.user.username}`;
  userRoleText.textContent = state.user.role === "admin" ? "Administrator" : "Team Member";
  currentUserName.textContent = state.user.username;
  currentUserRole.textContent = state.user.role === "admin" ? "Admin" : "Member";
  taskAssignInput.parentElement.style.display = state.user.role === "admin" ? "block" : "none";
};

const openTaskModal = () => {
  modalTitle.textContent = "Create new task";
  taskForm.reset();
  taskModalBackdrop.classList.add("active");
};

const closeTaskModal = () => {
  taskModalBackdrop.classList.remove("active");
};

const openConfirmModal = (taskId, title) => {
  state.currentDeleteTask = taskId;
  confirmTaskButton.textContent = `Delete ${title}`;
  confirmModalBackdrop.classList.add("active");
};

const closeConfirmModal = () => {
  state.currentDeleteTask = null;
  confirmModalBackdrop.classList.remove("active");
};

const handleAuthSuccess = ({ token, user }) => {
  state.token = token;
  state.user = { id: user.id, username: user.username, role: user.role };
  saveSession();
  authScreen.classList.add("page-hidden");
  appShell.classList.remove("page-hidden");
  populateUserInfo();
  loadDashboard();
};

const signup = async (event) => {
  event.preventDefault();
  try {
    showLoader(true);
    const username = document.getElementById("signupUsername").value.trim();
    const password = document.getElementById("signupPassword").value.trim();
    const data = await fetchJson(`${API_BASE}/auth/signup`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    handleAuthSuccess(data);
    showToast(data.message, "success");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    showLoader(false);
  }
};

const login = async (event) => {
  event.preventDefault();
  try {
    showLoader(true);
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const data = await fetchJson(`${API_BASE}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    handleAuthSuccess(data);
    showToast(data.message, "success");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    showLoader(false);
  }
};

const loadDashboard = async () => {
  try {
    showLoader(true);
    await Promise.all([loadTasks(), loadStats()]);
  } catch (error) {
    showToast(error.message, "error");
    if (error.message.toLowerCase().includes("token")) {
      logout();
    }
  } finally {
    showLoader(false);
  }
};

const loadTasks = async () => {
  const params = new URLSearchParams();
  if (state.filters.search) params.set("search", state.filters.search);
  if (state.filters.status) params.set("status", state.filters.status);
  const data = await fetchJson(`${API_BASE}/tasks?${params.toString()}`);
  state.tasks = data;
  renderTasks();
};

const loadStats = async () => {
  const data = await fetchJson(`${API_BASE}/tasks/stats`);
  state.stats = data;
  renderStats();
  renderRecentActivity();
};

const updateTaskStatus = async (taskId, currentStatus) => {
  try {
    showLoader(true);
    const nextStatus = currentStatus === "pending" ? "in-progress" : currentStatus === "in-progress" ? "done" : "done";
    await fetchJson(`${API_BASE}/tasks/${taskId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: nextStatus }),
    });
    showToast("Task status updated.", "success");
    await loadDashboard();
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    showLoader(false);
  }
};

const deleteTask = async () => {
  if (!state.currentDeleteTask) return;
  try {
    showLoader(true);
    await fetchJson(`${API_BASE}/tasks/${state.currentDeleteTask}`, {
      method: "DELETE",
    });
    closeConfirmModal();
    showToast("Task removed successfully.", "success");
    await loadDashboard();
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    showLoader(false);
  }
};

const saveTask = async (event) => {
  event.preventDefault();

  try {
    showLoader(true);
    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();
    const dueDate = taskDueInput.value;
    const priority = taskPriorityInput.value;
    const project = taskProjectInput.value.trim();
    const assignedTo = taskAssignInput.value.trim();

    if (!title) {
      showToast("Please provide a task title.", "error");
      return;
    }

    await fetchJson(`${API_BASE}/tasks`, {
      method: "POST",
      body: JSON.stringify({ title, description, dueDate, priority, project, assignedTo }),
    });

    closeTaskModal();
    taskForm.reset();
    showToast("Task created successfully.", "success");
    await loadDashboard();
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    showLoader(false);
  }
};

const switchTab = (tab) => {
  const isLogin = tab === "login";
  loginTab.classList.toggle("active", isLogin);
  signupTab.classList.toggle("active", !isLogin);
  document.getElementById("loginFormContainer").classList.toggle("page-hidden", !isLogin);
  document.getElementById("signupFormContainer").classList.toggle("page-hidden", isLogin);
  authTitle.textContent = isLogin ? "Sign in to your workspace" : "Create your team hub";
  authDescription.textContent = isLogin
    ? "Access your dashboard, update tasks and stay aligned with your team."
    : "Build your workspace, collaborate with your team, and organize tasks in one place.";
};

const toggleTheme = () => {
  document.body.classList.toggle("light-mode");
  localStorage.setItem("themePreference", document.body.classList.contains("light-mode") ? "light" : "dark");
};

const loadTheme = () => {
  const theme = localStorage.getItem("themePreference") || "dark";
  document.body.classList.toggle("light-mode", theme === "light");
};

const initializeApp = async () => {
  loadTheme();

  const saved = localStorage.getItem(authStorageKey);
  if (saved) {
    const session = JSON.parse(saved);
    state.token = session.token;
    state.user = session.user;
    authScreen.classList.add("page-hidden");
    appShell.classList.remove("page-hidden");
    populateUserInfo();
    await loadDashboard();
  }

  updateNavigation();
  setInterval(loadDashboard, 22000);
};

window.switchSection = switchSection;
window.openTaskModal = openTaskModal;
window.openConfirmModal = openConfirmModal;
window.updateTaskStatus = updateTaskStatus;
window.deleteTask = deleteTask;

loginForm.addEventListener("submit", login);
signupForm.addEventListener("submit", signup);
loginTab.addEventListener("click", () => switchTab("login"));
signupTab.addEventListener("click", () => switchTab("signup"));
statusFilter.addEventListener("change", (event) => {
  state.filters.status = event.target.value;
  loadTasks();
});
searchInput.addEventListener("input", (event) => {
  state.filters.search = event.target.value;
  loadTasks();
});
searchInputMobile?.addEventListener("input", (event) => {
  state.filters.search = event.target.value;
  loadTasks();
});
themeToggle.addEventListener("click", toggleTheme);

saveTaskButton.addEventListener("click", saveTask);
confirmTaskButton.addEventListener("click", deleteTask);
closeTaskModalButton.addEventListener("click", closeTaskModal);
closeConfirmModalButton.addEventListener("click", closeConfirmModal);

document.getElementById("logoutButton").addEventListener("click", logout);

document.querySelectorAll(".sidebar button[data-section]").forEach((button) => {
  button.addEventListener("click", () => switchSection(button.dataset.section));
});

initializeApp();
