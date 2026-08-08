import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// =========================================================
// ⚠️ REPLACE THESE TWO STRINGS WITH YOUR ACTUAL SUPABASE KEYS
// =========================================================
const SUPABASE_URL = 'https://qdzadypqtctjonnwgxoo.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkemFkeXBxdGN0am9ubndneG9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxOTIyMTYsImV4cCI6MjEwMTc2ODIxNn0.yE6C0ajDrbgJj3RbvH6X9liCoTYsXpd2RUpGRHbjcf8';

// Safe initialization check
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
  // CHECK USER SESSION & UPDATE NAVBAR 
  // (Professional Dropdown Menu)
  // =========================================================
  if (supabase && userNavArea) {
    try {
      // Get the currently logged-in user's session
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Fetch the user's full name and role from the 'profiles' database table
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single();

        // Use the profile name, or default to their email if name is missing
        const userName = profile && profile.full_name ? profile.full_name : user.email.split('@')[0];
        
        // Add a small badge to show if they are an Author or Reader
        const roleBadge = profile && profile.role === 'author' 
          ? '<span class="badge bg-warning text-dark ms-1" style="font-size: 0.65em;">Author</span>' 
          : '';

        // Generate dynamic dropdown items based on role
        const authorMenuItems = profile && profile.role === 'author' 
          ? `<li><a class="dropdown-item fw-semibold text-secondary py-2" href="upload.html"><i class="fa-solid fa-upload me-2 text-teal"></i> Author Dashboard</a></li>` 
          : '';

        // Inject the Bootstrap Dropdown into the navbar
        userNavArea.innerHTML = `
          <div class="nav-item dropdown custom-hover-dropdown">
            <a class="nav-link dropdown-toggle text-white fw-semibold d-flex align-items-center" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fa-solid fa-circle-user text-warning fs-5 me-2"></i> Hello, ${userName} ${roleBadge}
            </a>
            <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-1" aria-labelledby="userDropdown" style="min-width: 200px; border-radius: 8px;">
              <li><a class="dropdown-item fw-semibold text-secondary py-2" href="profile.html"><i class="fa-solid fa-user-pen me-2 text-teal"></i> My Profile</a></li>
              <li><a class="dropdown-item fw-semibold text-secondary py-2" href="orders.html"><i class="fa-solid fa-box-open me-2 text-teal"></i> My Orders</a></li>
              ${authorMenuItems}
              <li><hr class="dropdown-divider my-1"></li>
              <li><button id="logoutBtn" class="dropdown-item fw-bold text-danger py-2"><i class="fa-solid fa-right-from-bracket me-2"></i> Logout</button></li>
            </ul>
          </div>
        `;

        // Handle Logout Button Click
        document.getElementById("logoutBtn").addEventListener("click", async () => {
          await supabase.auth.signOut();
          window.location.reload(); // Refresh the page to show Login/Sign Up again
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }

  // Helper function to display alert messages
  function showAlert(message, type) {
    if (!alertBox) return;
    alertBox.className = `alert alert-${type} text-center`;
    alertBox.textContent = message;
    alertBox.classList.remove("d-none");
  }

  if (!supabase && (loginForm || registerForm)) {
    showAlert("Supabase URL is not configured. Please update auth.js.", "danger");
  }

  document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tab => {
    tab.addEventListener('shown.bs.tab', () => {
      if (alertBox) alertBox.classList.add("d-none");
    });
  });

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
      const password = document.getElementById("regPassword").value.trim();
      const confirmPassword = document.getElementById("regConfirmPassword").value.trim();

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
            data: {
              full_name: fullName,
              phone: phone,
              address: address,
              role: role
            }
          }
        });

        if (authError) throw authError;

        showAlert("Account created successfully! Redirecting to login...", "success");
        registerForm.reset();

        setTimeout(() => {
          const loginTabBtn = document.querySelector('#login-tab');
          if (loginTabBtn) {
            const loginTab = new bootstrap.Tab(loginTabBtn);
            loginTab.show();
          }
          showAlert("Registration successful! Please log in.", "info");
        }, 1500);

      } catch (error) {
        console.error("Sign Up Error:", error);
        showAlert(error.message || "Failed to create account.", "danger");
      }
    });
  }

  // =========================================================
  // 2. LOGIN FORM SUBMISSION
  // =========================================================
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (!supabase) return;

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

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

        showAlert("Login successful! Checking account type...", "info");

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        let targetPage = "index.html"; 

        if (profile && profile.role === "author") {
          targetPage = "upload.html"; 
        }

        showAlert("Redirecting you now...", "success");

        setTimeout(() => {
          window.location.href = targetPage;
        }, 1200);

      } catch (error) {
        console.error("Login Error:", error);
        showAlert(error.message || "Invalid email or password.", "danger");
      }
    });
  }
});