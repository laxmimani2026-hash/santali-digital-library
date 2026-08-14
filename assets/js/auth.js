import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// =========================================================
// SUPABASE CONFIGURATION
// =========================================================
const SUPABASE_URL = 'https://qdzadypqtctjonnwgxoo.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkemFkeXBxdGN0am9ubndneG9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxOTIyMTYsImV4cCI6MjEwMTc2ODIxNn0.yE6C0ajDrbgJj3RbvH6X9liCoTYsXpd2RUpGRHbjcf8';

let supabase = null;
if (SUPABASE_URL.startsWith('https://') && !SUPABASE_URL.includes('YOUR_PROJECT_ID')) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

document.addEventListener("DOMContentLoaded", async function () {
  const alertBox = document.getElementById("authAlert");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const userNavArea = document.getElementById("userNavArea");

  // =========================================================
  // CHECK USER SESSION & UPDATE NAVBAR (WITH HOVER & SUBSCRIPTION)
  // =========================================================
  if (supabase && userNavArea) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role, avatar_url')
          .eq('id', user.id)
          .single();

        const userName = profile && profile.full_name ? profile.full_name : user.email.split('@')[0];
        const isAuthor = profile && profile.role === 'author';

        // Badge display
        const roleBadge = isAuthor 
          ? '<span class="badge bg-warning text-dark ms-1" style="font-size: 0.65em;">Author</span>' 
          : '<span class="badge bg-info text-dark ms-1" style="font-size: 0.65em;">Reader</span>';

        // Author Dashboard link for Authors
        const authorMenuItems = isAuthor 
          ? `<li><a class="dropdown-item fw-semibold text-secondary py-2" href="author-dashboard.html"><i class="fa-solid fa-upload me-2 text-teal"></i> Author Dashboard</a></li>` 
          : '';

        // Avatar HTML
        const avatarHtml = profile && profile.avatar_url
          ? `<img src="${profile.avatar_url}" alt="Profile" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 2px solid #ffc107;" class="me-2 shadow-sm">`
          : `<i class="fa-solid fa-circle-user text-warning fs-5 me-2"></i>`;

        // Inject Dropdown with Subscription Option
        userNavArea.innerHTML = `
          <div class="nav-item dropdown custom-hover-dropdown">
            <a class="nav-link dropdown-toggle text-white fw-semibold d-flex align-items-center" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              ${avatarHtml} Hello, ${userName} ${roleBadge}
            </a>
            <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-1" aria-labelledby="userDropdown" style="min-width: 220px; border-radius: 8px;">
              <li><a class="dropdown-item fw-semibold text-secondary py-2" href="profile.html"><i class="fa-solid fa-user-pen me-2 text-teal"></i> My Profile</a></li>
              <li><a class="dropdown-item fw-semibold text-secondary py-2" href="subscription.html"><i class="fa-solid fa-crown me-2 text-warning"></i> My Subscription</a></li>
              <li><a class="dropdown-item fw-semibold text-secondary py-2" href="cart.html"><i class="fa-solid fa-cart-shopping me-2 text-teal"></i> My Cart</a></li>
              <li><a class="dropdown-item fw-semibold text-secondary py-2" href="orders.html"><i class="fa-solid fa-box-open me-2 text-teal"></i> My Orders</a></li>
              ${authorMenuItems}
              <li><hr class="dropdown-divider my-1"></li>
              <li><button id="logoutBtn" class="dropdown-item fw-bold text-danger py-2"><i class="fa-solid fa-right-from-bracket me-2"></i> Logout</button></li>
            </ul>
          </div>
        `;

        // Handle Logout
        document.getElementById("logoutBtn").addEventListener("click", async () => {
          await supabase.auth.signOut();
          window.location.href = "login.html"; 
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }

  function showAlert(message, type) {
    if (!alertBox) return;
    alertBox.className = `alert alert-${type} text-center`;
    alertBox.textContent = message;
    alertBox.classList.remove("d-none");
  }

  // =========================================================
  // 1. SIGN UP FORM SUBMISSION
  // =========================================================
  if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (!supabase) return;

      const fullName = document.getElementById("regFullName").value.trim();
      const email = document.getElementById("regEmail").value.trim();
      const phone = document.getElementById("regPhone").value.trim();
      const address = document.getElementById("regAddress").value.trim();
      const role = document.getElementById("regRole").value;
      const password = document.getElementById("regPassword").value;
      const confirmPassword = document.getElementById("regConfirmPassword").value;

      if (!fullName || !email || !phone || !address || !password || !confirmPassword) {
        showAlert("Please fill in all required fields.", "danger");
        return;
      }

      if (password !== confirmPassword) {
        showAlert("Passwords do not match.", "warning");
        return;
      }

      showAlert("Creating account...", "info");

      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: { full_name: fullName, phone: phone, address: address, role: role }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          await supabase.from('profiles').upsert({
            id: authData.user.id,
            full_name: fullName,
            phone: phone,
            address: address,
            role: role
          });
        }

        showAlert("Account created successfully! Redirecting...", "success");
        registerForm.reset();

        // Redirect based on Role: Author -> Home Page, Reader -> Browse Page
        setTimeout(() => {
          if (role === 'author') {
            window.location.href = "index.html"; 
          } else {
            window.location.href = "browse.html";
          }
        }, 1500);

      } catch (error) {
        console.error("Sign Up Error:", error);
        showAlert(error.message || "Failed to create account.", "danger");
      }
    });
  }

  // =========================================================
  // 2. LOGIN FORM SUBMISSION (ROLE-BASED REDIRECT)
  // =========================================================
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (!supabase) return;

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;

      if (!email || !password) {
        showAlert("Please enter both email and password.", "danger");
        return;
      }

      showAlert("Logging in...", "info");

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) throw error;

        // Fetch user profile role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        showAlert("Login successful! Redirecting...", "success");

        // Redirect logic based on query parameter or user role
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect');

        setTimeout(() => {
          if (redirectUrl) {
            window.location.href = redirectUrl;
          } else if (profile && profile.role === 'author') {
            window.location.href = "index.html"; // Opens Author Home Page
          } else if (profile && profile.role === 'reader') {
            window.location.href = "browse.html"; // Opens Reader Browse Page
          } else {
            window.location.href = "index.html"; // Default fallback
          }
        }, 1200);

      } catch (error) {
        console.error("Login Error:", error);
        showAlert(error.message || "Invalid email or password.", "danger");
      }
    });
  }
});