const token = localStorage.getItem("fitvit_token");

export function requireAuth() {
  if (!token) {
    window.location.href = "../index.html";
  }
}

export function wireShell() {
  const logout = document.getElementById("logoutBtn");
  const home = document.getElementById("homeBtn");

  if (home) {
    home.addEventListener("click", () => {
      window.location.href = "./00-home.html";
    });
  }

  if (logout) {
    logout.addEventListener("click", () => {
      localStorage.removeItem("fitvit_token");
      localStorage.removeItem("fitvit_user");
      window.location.href = "../index.html";
    });
  }
}
