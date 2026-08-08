import { auth, db } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  updateProfile,
  onAuthStateChanged,
  signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const alertBox = document.getElementById('authAlert');

// Helper to show alerts
function showAlert(message, type = 'danger') {
  if (!alertBox) return;
  alertBox.className = `alert alert-${type}`;
  alertBox.textContent = message;
  alertBox.classList.remove('d-none');
}

// ================= 1. REGISTER USER =================
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Set Display Name
      await updateProfile(user, { displayName: name });

      // Save user profile & role in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: name,
        email: email,
        role: role, // 'reader' or 'author'
        createdAt: serverTimestamp()
      });

      showAlert("Account created successfully! Redirecting...", "success");
      
      setTimeout(() => {
        window.location.href = role === 'author' ? 'author-dashboard.html' : 'index.html';
      }, 1500);

    } catch (error) {
      console.error("Registration Error:", error);
      showAlert(error.message);
    }
  });
}

// ================= 2. LOGIN USER =================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check user role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const role = userDoc.exists() ? userDoc.data().role : 'reader';

      showAlert("Login successful! Redirecting...", "success");

      setTimeout(() => {
        window.location.href = role === 'author' ? 'author-dashboard.html' : 'index.html';
      }, 1000);

    } catch (error) {
      console.error("Login Error:", error);
      showAlert("Invalid email or password. Please try again.");
    }
  });
}

// ================= 3. GOOGLE SIGN-IN =================
const googleAuthBtn = document.getElementById('googleAuthBtn');
if (googleAuthBtn) {
  googleAuthBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile already exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Save new Google user as default reader
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          role: 'reader',
          createdAt: serverTimestamp()
        });
      }

      window.location.href = 'index.html';
    } catch (error) {
      console.error("Google Auth Error:", error);
      showAlert("Google Sign-In failed.");
    }
  });
}

// ================= 4. AUTH STATE LISTENER (For All Pages) =================
onAuthStateChanged(auth, async (user) => {
  const userNavContainer = document.getElementById('userNavArea');
  if (!userNavContainer) return;

  if (user) {
    // User is signed in
    const userSnap = await getDoc(doc(db, "users", user.uid));
    const role = userSnap.exists() ? userSnap.data().role : 'reader';

    userNavContainer.innerHTML = `
      <div class="dropdown">
        <button class="btn btn-gold btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
          <i class="fa-solid fa-user me-1"></i> ${user.displayName || 'Account'}
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          ${role === 'author' ? '<li><a class="dropdown-menu-item dropdown-item" href="author-dashboard.html"><i class="fa-solid fa-gauge me-2"></i>Dashboard</a></li>' : ''}
          <li><a class="dropdown-item" href="browse.html"><i class="fa-solid fa-book me-2"></i>My Library</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><button id="logoutBtn" class="dropdown-item text-danger"><i class="fa-solid fa-right-from-bracket me-2"></i>Logout</button></li>
        </ul>
      </div>
    `;

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      signOut(auth).then(() => window.location.reload());
    });

  } else {
    // User is logged out
    userNavContainer.innerHTML = `<a class="btn btn-gold btn-sm px-4" href="login.html">Login</a>`;
  }
});