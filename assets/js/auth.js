import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// ⚠️ Replace with your actual Supabase keys
const SUPABASE_URL = 'sb_publishable_Y1WI4fBt5oHOi0IWYIvIig_gdoPEmQ5';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkemFkeXBxdGN0am9ubndneG9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxOTIyMTYsImV4cCI6MjEwMTc2ODIxNn0.yE6C0ajDrbgJj3RbvH6X9liCoTYsXpd2RUpGRHbjcf8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", function () {
  const alertBox = document.getElementById("authAlert");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  function showAlert(message, type) {
    if (!alertBox) return;
    alertBox.className = `alert alert-${type} text-center`;
    alertBox.textContent = message;
    alertBox.classList.remove("d-none");
  }

  // Clear alerts when switching tabs
  document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tab => {
    tab.addEventListener('shown.bs.tab', () => {
      if (alertBox) alertBox.classList.add("d-none");
    });
  });

  // SIGN UP FORM
  if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();

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
        });

        if (authError) throw authError;

        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: authData.user.id,
                full_name: fullName,
                phone: phone,
                address: address,
                role: role
              }
            ]);

          if (profileError) throw profileError;
        }

        showAlert("Account created successfully! Switching to login...", "success");
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
        showAlert(error.message || "Failed to create account.", "danger");
      }
    });
  }

  // LOGIN FORM
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      if (!email || !password) {
        showAlert("Please enter email and password.", "danger");
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
        showAlert(error.message || "Invalid login credentials.", "danger");
      }
    });
  }
});