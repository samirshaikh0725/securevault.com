// Homepage loaded
console.log("Homepage loaded successfully.");

// Smooth scroll for CTA button
document.addEventListener("DOMContentLoaded", () => {
  const cta = document.querySelector(".cta");
  if (cta) {
    cta.addEventListener("click", (e) => {
      console.log("CTA button clicked!");
      cta.classList.add("clicked");
      setTimeout(() => {
        cta.classList.remove("clicked");
      }, 300);
    });
  }

  // Nav hover logs
  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach((link) => {
    link.addEventListener("mouseover", () => {
      console.log(`Hovering over nav: ${link.textContent}`);
    });
  });

  // New navigation behavior
  const loginLink = document.getElementById("home-login-link");
  const registerLink = document.getElementById("home-register-link");
  const adminLink = document.getElementById("home-admin-link");

  if (loginLink) {
    loginLink.addEventListener("click", () => {
      window.location.href = "main.html?show=login";
    });
  }

  if (registerLink) {
    registerLink.addEventListener("click", () => {
      window.location.href = "main.html?show=signup";
    });
  }

  if (adminLink) {
    adminLink.addEventListener("click", () => {
      window.location.href = "main.html?show=admin";
    });
  }
});
