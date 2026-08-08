import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// =========================================================
// ⚠️ REPLACE THESE TWO STRINGS WITH YOUR ACTUAL SUPABASE KEYS
// =========================================================
const SUPABASE_URL = 'https://qdzadypqtctjonnwgxoo.supabase.co'; // Must start with https://
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkemFkeXBxdGN0am9ubndneG9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxOTIyMTYsImV4cCI6MjEwMTc2ODIxNn0.yE6C0ajDrbgJj3RbvH6X9liCoTYsXpd2RUpGRHbjcf8';

// Safe initialization check
let supabase = null;
if (SUPABASE_URL.startsWith('https://') && !SUPABASE_URL.includes('YOUR_PROJECT_ID')) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

document.addEventListener("DOMContentLoaded", function () {
  const alertBox = document.getElementById("authAlert");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  // Helper function to display alert messages
  function showAlert(message, type) {
    if (!alertBox) return;
    alertBox.className = `alert alert-${type} text-center`;
    alertBox.textContent = message;
    alertBox.classList.remove("d-none");
  }

  // Check if Supabase keys are configured properly
  if (!supabase) {
    showAlert("Supabase URL is not configured. Please update auth.js with your project credentials.", "danger");
  }

  // Clear alerts when switching between tabs
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

      if (!supabase) {
        showAlert("Cannot submit: Supabase is not initialized. Check auth.js credentials.", "danger");
        return;
      }

      const fullName = document.getElementById("regFullName").value.trim();
      const email = document.getElementById("regEmail").value.trim();
      const phone = document.getElementById("regPhone").value.trim();
      const address = document.getElementById("regAddress").value.trim();
      const role = document.getElementById("regRole").value;
      const password = document.getElementById("regPassword").value.trim();
      const confirmPassword = document.getElementById("regConfirmPassword").value.trim();

      // Form validation
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
        // Create user with metadata payload
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

        // Show success message
        showAlert("Account created successfully! Redirecting to login...", "success");
        registerForm.reset();

        // Switch to login tab after 1.5 seconds
        setTimeout(() => {
          const loginTabBtn = document.querySelector('#login-tab');
          if (loginTabBtn) {
            const loginTab = new bootstrap.Tab(loginTabBtn);
            loginTab.show();
          }
          showAlert("Registration successful! Please log in with your credentials.", "info");
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

      if (!supabase) {
        showAlert("Cannot login: Supabase is not initialized.", "danger");
        return;
      }

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

        showAlert("Login successful! Redirecting...", "success");

        setTimeout(() => {
          window.location.href = "index.html";
        }, 1200);

      } catch (error) {
        console.error("Login Error:", error);
        showAlert(error.message || "Invalid email or password.", "danger");
      }
    });
  }
});