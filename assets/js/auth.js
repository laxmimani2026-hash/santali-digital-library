// ================= 4. AUTH STATE LISTENER (For All Pages) =================
onAuthStateChanged(auth, async (user) => {
  const userNavContainer = document.getElementById('userNavArea');
  if (!userNavContainer) return;

  if (user) {
    // User is signed in -> Show User Profile Dropdown
    const userSnap = await getDoc(doc(db, "users", user.uid));
    const role = userSnap.exists() ? userSnap.data().role : 'reader';

    userNavContainer.innerHTML = `
      <div class="dropdown">
        <button class="btn btn-gold btn-sm dropdown-toggle fw-bold px-3" type="button" data-bs-toggle="dropdown">
          <i class="fa-solid fa-user me-1"></i> ${user.displayName || 'Account'}
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow">
          ${role === 'author' ? '<li><a class="dropdown-item" href="author-dashboard.html"><i class="fa-solid fa-gauge me-2"></i>Author Dashboard</a></li>' : ''}
          <li><a class="dropdown-item" href="browse.html"><i class="fa-solid fa-book me-2"></i>My Library</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><button id="logoutBtn" class="dropdown-item text-danger fw-semibold"><i class="fa-solid fa-right-from-bracket me-2"></i>Logout</button></li>
        </ul>
      </div>
    `;

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      signOut(auth).then(() => window.location.reload());
    });

  } else {
    // User is logged out -> Show BOTH Login and Sign Up buttons
    userNavContainer.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <a class="btn btn-outline-light btn-sm px-3" href="login.html">Login</a>
        <a class="btn btn-gold btn-sm px-3" href="login.html#register">Sign Up</a>
      </div>
    `;
  }
});