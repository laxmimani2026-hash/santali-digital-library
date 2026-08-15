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
  // CHECK USER SESSION & UPDATE NAVBAR (PROFESSIONAL DISPLAY)
  // =========================================================
  if (supabase && userNavArea) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, full_name, role, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        // 1. Determine Display Name
        let firstName = '';
        if (profile?.first_name) {
          firstName = profile.first_name.trim();
        } else if (profile?.full_name) {
          firstName = profile.full_name.trim().split(/\s+/)[0];
        } else if (user.user_metadata?.first_name) {
          firstName = user.user_metadata.first_name.trim();
        } else if (user.user_metadata?.full_name) {
          firstName = user.user_metadata.full_name.trim().split(/\s+/)[0];
        } else {
          firstName = user.email.split('@')[0];
        }

        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

        // 2. Format Role Badge & Role Dashboard Links
        const rawRole = (profile?.role || user.user_metadata?.role || 'reader').toLowerCase();
        let roleBadge = '';
        let roleDashboardItem = '';

        if (rawRole === 'admin') {
          roleBadge = `<span class="badge" style="background-color: #ef4444; color: #fff; font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 12px; letter-spacing: 0.3px;">ADMIN</span>`;
          roleDashboardItem = `<li><a class="dropdown-item d-flex align-items-center py-2 text-danger fw-semibold" href="admin-dashboard.html"><i class="fa-solid fa-shield-halved text-danger me-2" style="width: 20px;"></i> Admin Dashboard</a></li>`;
        } else if (rawRole.includes('distributor') || rawRole.includes('vendor')) {
          roleBadge = `<span class="badge" style="background-color: #2563eb; color: #fff; font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 12px; letter-spacing: 0.3px;">DISTRIBUTOR</span>`;
          roleDashboardItem = `<li><a class="dropdown-item d-flex align-items-center py-2 text-primary fw-semibold" href="distributor-dashboard.html"><i class="fa-solid fa-truck-ramp-box text-primary me-2" style="width: 20px;"></i> Distributor Dashboard</a></li>`;
        } else if (rawRole.includes('author') || rawRole.includes('publisher')) {
          roleBadge = `<span class="badge" style="background-color: #ffb703; color: #000; font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 12px; letter-spacing: 0.3px;">AUTHOR</span>`;
          roleDashboardItem = `<li><a class="dropdown-item d-flex align-items-center py-2 text-warning fw-semibold" href="author-dashboard.html"><i class="fa-solid fa-gauge text-warning me-2" style="width: 20px;"></i> Author Dashboard</a></li>`;
        } else {
          roleBadge = `<span class="badge" style="background-color: #00b4d8; color: #fff; font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 12px; letter-spacing: 0.3px;">READER</span>`;
          roleDashboardItem = `<li><a class="dropdown-item d-flex align-items-center py-2 text-info fw-semibold" href="reader-dashboard.html"><i class="fa-solid fa-book-bookmark text-info me-2" style="width: 20px;"></i> Reader Dashboard</a></li>`;
        }

        // Avatar HTML with fallback
        const avatarHtml = profile && profile.avatar_url
          ? `<img src="${profile.avatar_url}" alt="Avatar" style="width: 32px; height: 32px; object-fit: cover; border-radius: 50%; border: 1.5px solid rgba(255, 255, 255, 0.6);" class="shadow-sm">`
          : `<div style="width: 32px; height: 32px; border-radius: 50%; background-color: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.4); display: inline-flex; align-items: center; justify-content: center; color: #ffffff; font-size: 0.9rem;"><i class="fa-solid fa-user"></i></div>`;

        // Inject Dropdown
        userNavArea.innerHTML = `
          <div class="nav-item dropdown custom-hover-dropdown">
            <a class="nav-link dropdown-toggle text-white d-flex align-items-center gap-2 py-1" href="#" id="profileDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" style="font-weight: 500;">
              ${avatarHtml}
              <span>Hello, ${firstName}</span>
              ${roleBadge}
            </a>
            <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2 profile-dropdown-menu" aria-labelledby="profileDropdown" style="min-width: 220px; border-radius: 12px;">
              <li>
                <a class="dropdown-item d-flex align-items-center py-2" href="profile.html">
                  <i class="fa-solid fa-user-gear text-muted me-2" style="width: 20px;"></i> My Profile
                </a>
              </li>
              <li>
                <a class="dropdown-item d-flex align-items-center py-2" href="subscription.html">
                  <i class="fa-solid fa-crown text-warning me-2" style="width: 20px;"></i> My Subscription
                </a>
              </li>
              <li>
                <a class="dropdown-item d-flex align-items-center py-2" href="cart.html">
                  <i class="fa-solid fa-cart-shopping text-muted me-2" style="width: 20px;"></i> My Cart
                </a>
              </li>
              <li>
                <a class="dropdown-item d-flex align-items-center py-2" href="orders.html">
                  <i class="fa-solid fa-box-archive text-muted me-2" style="width: 20px;"></i> My Orders
                </a>
              </li>
              ${roleDashboardItem ? `<li><hr class="dropdown-divider my-1"></li>${roleDashboardItem}` : ''}
              <li><hr class="dropdown-divider my-1"></li>
              <li>
                <button id="logoutBtn" class="dropdown-item d-flex align-items-center text-danger py-2 fw-semibold border-0 bg-transparent w-100">
                  <i class="fa-solid fa-arrow-right-from-bracket me-2" style="width: 20px;"></i> Logout
                </button>
              </li>
            </ul>
          </div>
        `;

        // Handle Logout
        document.getElementById("logoutBtn")?.addEventListener("click", async () => {
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

      const firstName = document.getElementById("regFirstName")?.value.trim() || "";
      const lastName = document.getElementById("regLastName")?.value.trim() || "";
      const email = document.getElementById("regEmail").value.trim();
      
      // Calculate Country Code + Phone
      const countryCodeSelect = document.getElementById("regCountryCode")?.value || "+91";
      const customCode = document.getElementById("customCountryCode")?.value.trim() || "";
      const rawPhone = document.getElementById("regPhone")?.value.trim() || "";
      
      const dialCode = countryCodeSelect === 'other' ? (customCode.startsWith('+') ? customCode : `+${customCode}`) : countryCodeSelect;
      const fullPhone = rawPhone ? `${dialCode} ${rawPhone}`.trim() : "";

      let role = document.getElementById("regRole")?.value || "reader";
      if (role.includes("distributor") || role.includes("vendor")) {
        role = "distributor";
      } else if (role.includes("author") || role.includes("publisher")) {
        role = "author";
      }

      const password = document.getElementById("regPassword").value;
      const confirmPassword = document.getElementById("regConfirmPassword").value;

      if (!email || !password || !confirmPassword || !firstName) {
        showAlert("Please fill in all required fields.", "danger");
        return;
      }

      if (password !== confirmPassword) {
        showAlert("Passwords do not match.", "warning");
        return;
      }

      showAlert("Creating account...", "info");

      try {
        const combinedName = `${firstName} ${lastName}`.trim();
        const userUid = 'SDL-' + Math.random().toString(36).substring(2, 8).toUpperCase();

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: { 
              first_name: firstName,
              last_name: lastName,
              full_name: combinedName, 
              phone: fullPhone, 
              role: role,
              user_uid: userUid
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          await supabase.from('profiles').upsert({
            id: authData.user.id,
            first_name: firstName,
            last_name: lastName,
            full_name: combinedName,
            user_uid: userUid,
            phone: fullPhone,
            role: role
          });
        }

        showAlert("Account created successfully! Redirecting...", "success");
        registerForm.reset();

        setTimeout(() => {
          if (role === 'distributor') {
            window.location.href = "distributor-dashboard.html";
          } else if (role === 'author') {
            window.location.href = "author-dashboard.html"; 
          } else {
            window.location.href = "reader-dashboard.html";
          }
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
          .maybeSingle();

        const userRole = (profile?.role || data.user.user_metadata?.role || 'reader').toLowerCase();

        showAlert("Login successful! Redirecting...", "success");

        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect');

        setTimeout(() => {
          if (redirectUrl) {
            window.location.href = redirectUrl;
          } else if (userRole === 'distributor' || userRole === 'vendor') {
            window.location.href = "distributor-dashboard.html";
          } else if (userRole === 'author' || userRole === 'publisher') {
            window.location.href = "author-dashboard.html";
          } else if (userRole === 'admin') {
            window.location.href = "admin-dashboard.html";
          } else {
            window.location.href = "reader-dashboard.html";
          }
        }, 1200);

      } catch (error) {
        console.error("Login Error:", error);
        showAlert(error.message || "Invalid email or password.", "danger");
      }
    });
  }
});