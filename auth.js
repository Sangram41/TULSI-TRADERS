// 1. Import Firebase tools directly from Google's servers
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
const firebaseConfig = {
  apiKey: "AIzaSyBi3NuEGxFg9prR-EHmKuAIs_a4pCEzKcE",
  authDomain: "tulsi-traders-482a5.firebaseapp.com",
  projectId: "tulsi-traders-482a5",
  storageBucket: "tulsi-traders-482a5.firebasestorage.app",
  messagingSenderId: "677454540523",
  appId: "1:677454540523:web:04293e179692b3b0c0d8ae",
  measurementId: "G-KEBM4M16ZJ"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

console.log("Firebase is successfully connected!");



// PHASE 3: SIGN UP NEW USERS

// 1. Tell JavaScript to find the form we just named
const signupForm = document.getElementById("signup-form");

// 2. Check if we are actually on the Sign Up page
if (signupForm) {
  
  // 3. Listen for the moment the user clicks the "Sign Up" button
  signupForm.addEventListener("submit", function(event) {
    
    // Stop the page from refreshing!
    event.preventDefault(); 

    // Grab the exact text the user typed into the boxes
    const userEmail = document.getElementById("email").value;
    const userPassword = document.getElementById("password").value;

    // 4. Send that text to Firebase to create the account
    createUserWithEmailAndPassword(auth, userEmail, userPassword)
      .then((userCredential) => {
        // IF SUCCESSFUL:
        alert("Account created successfully! Welcome to Tulsi Traders.");
        window.location.href = "TULSI1.html"; // Send them back to the home page!
      })
      .catch((error) => {
        // IF SOMETHING GOES WRONG:
        // (For example, the password is too short, or the email is already used)
        alert("Oops! " + error.message);
      });

  });
}


// PHASE 4: LOG IN EXISTING USERS


// 1. Tell JavaScript to find the Login form
const loginForm = document.getElementById("login-form");

// 2. Check if we are actually on the Login page
if (loginForm) {
  
  // 3. Listen for the moment the user clicks "Sign In"
  loginForm.addEventListener("submit", function(event) {
    
    // Stop the page from refreshing!
    event.preventDefault(); 

    // Grab the email and password they typed
    const userEmail = document.getElementById("email").value;
    const userPassword = document.getElementById("password").value;

    // 4. Send it to Firebase to verify their identity
    signInWithEmailAndPassword(auth, userEmail, userPassword)
      .then((userCredential) => {
        // IF SUCCESSFUL (The email and password match the database!):
        alert("Welcome back to Tulsi Traders!");
        window.location.href = "TULSI1.html"; // Send them to the home page
      })
      .catch((error) => {
        // IF SOMETHING GOES WRONG (Wrong password or email doesn't exist):
        alert("Login failed! Please check your email and password.");
      });

  });
}


// PHASE 5: GOOGLE LOGIN


// 1. Find the Google button on the page
const googleBtn = document.getElementById("google-btn");

// 2. Set up the official Google ID Badge
const provider = new GoogleAuthProvider();

// 3. Check if the Google button actually exists on the screen
if (googleBtn) {
  
  // 4. Listen for the click
  googleBtn.addEventListener("click", function() {
    
    // Tell the waiter to open the secure Google window
    signInWithPopup(auth, provider)
      .then((result) => {
        // IF SUCCESSFUL: 
        // We can actually grab their Google name to say hello!
        const user = result.user;
        alert("Welcome, " + user.displayName + "!");
        window.location.href = "TULSI1.html"; // Send them to the homepage
      })
      .catch((error) => {
        // IF SOMETHING GOES WRONG (They closed the pop-up early, etc.)
        alert("Google sign-in was cancelled or failed.");
      });

  });
}

// PHASE 6: GITHUB LOGIN

// 1. Find the GitHub button
const githubBtn = document.getElementById("github-btn");

// 2. Set up the official GitHub ID Badge
const githubProvider = new GithubAuthProvider();

// 3. Check if the GitHub button is on the screen
if (githubBtn) {
  
  // 4. Listen for the click
  githubBtn.addEventListener("click", function() {
    
    // Open the secure GitHub window
    signInWithPopup(auth, githubProvider)
      .then((result) => {
        // IF SUCCESSFUL:
        const user = result.user;
        alert("Welcome, " + user.displayName + "!");
        window.location.href = "TULSI1.html"; 
      })
      .catch((error) => {
        // IF SOMETHING GOES WRONG:
        alert("GitHub sign-in failed. " + error.message);
      });

  });
}

// PHASE 7: WATCH AUTH STATE & LOGOUT

// 1. Find the navbar items
const loginNavItem = document.getElementById("login-nav-item");
const logoutNavItem = document.getElementById("logout-nav-item");
const logoutBtn = document.getElementById("logout-btn"); // <--- I ADDED THIS BACK IN!
const userEmailDisplay = document.getElementById("user-email-display");

// 2. The "Security Camera" that constantly watches the user's status
onAuthStateChanged(auth, (user) => {
  if (user) {
    // THE USER IS LOGGED IN!
    if (loginNavItem) loginNavItem.style.display = "none";
    if (logoutNavItem) logoutNavItem.style.display = "block";
    
    // Inject their email into the navbar!
    if (userEmailDisplay) {
        userEmailDisplay.innerText = user.email;
    }

  } else {
    // THE USER IS LOGGED OUT!
    if (loginNavItem) loginNavItem.style.display = "block";
    if (logoutNavItem) logoutNavItem.style.display = "none";
  }
});

// 3. Make the Logout button actually work
if (logoutBtn) {
  logoutBtn.addEventListener("click", function(event) {
    event.preventDefault(); 
    
    signOut(auth).then(() => {
      alert("You have been safely logged out.");
      window.location.href = "TULSI1.html"; 
    }).catch((error) => {
      alert("Error logging out: " + error.message);
    });
  });
}

// ==========================================
// MOBILE MENU TOGGLE
// ==========================================
const menuIcon = document.getElementById("menu-icon");
const navMenu = document.querySelector(".navbar ul");

if (menuIcon && navMenu) {
  menuIcon.addEventListener("click", function() {
    // This adds or removes the "active" class to trigger the CSS slide animation
    navMenu.classList.toggle("active");
  });
}

// ==========================================
// SCROLL REVEAL — PHILOSOPHY SECTION
// ==========================================
const revealTargets = document.querySelectorAll(".philosophy-image, .philosophy-text");

if (revealTargets.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  revealTargets.forEach(el => observer.observe(el));
}

// ==========================================
// STAT COUNTER (Philosophy section)
// ==========================================
const statNumbers = document.querySelectorAll(".stat h3");

if (statNumbers.length) {
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const finalText = el.textContent.trim(); // e.g. "100%" or "Zero"
        const numMatch = finalText.match(/\d+/);

        if (numMatch) {
          const target = parseInt(numMatch[0]);
          const suffix = finalText.replace(numMatch[0], "");
          let current = 0;
          const step = Math.ceil(target / 40);

          const tick = () => {
            current += step;
            if (current >= target) {
              el.textContent = target + suffix;
            } else {
              el.textContent = current + suffix;
              requestAnimationFrame(tick);
            }
          };
          tick();
        }
        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => statObserver.observe(el));
}

// ==========================================
// SHRINK NAVBAR ON SCROLL
// ==========================================
const navbarEl = document.querySelector(".navbar");

if (navbarEl) {
  window.addEventListener("scroll", () => {
    navbarEl.classList.toggle("scrolled", window.scrollY > 50);
  });
}

