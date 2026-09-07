// 1. Import Firebase tools directly from Google's servers
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// === NEW FIRESTORE IMPORTS ===
import { getFirestore, doc, setDoc, getDoc, arrayUnion, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

// === INITIALIZE FIRESTORE ===
export const db = getFirestore(app);
console.log("Firebase & Firestore are successfully connected!");
 

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


// Add this line at the top of PHASE 7
export let currentUserUID = null; 

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserUID = user.uid; // Store the ID for the cart to use!
    
    if (loginNavItem) loginNavItem.style.display = "none";
    if (logoutNavItem) logoutNavItem.style.display = "block";
    if (userEmailDisplay) userEmailDisplay.innerText = user.email;
  } else {
    currentUserUID = null; // Clear it when they log out
    
    if (loginNavItem) loginNavItem.style.display = "block";
    if (logoutNavItem) logoutNavItem.style.display = "none";
  }
});

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

// MOBILE MENU TOGGLE

const menuIcon = document.getElementById("menu-icon");
const navMenu = document.querySelector(".navbar ul");

if (menuIcon && navMenu) {
  menuIcon.addEventListener("click", function() {
    // This adds or removes the "active" class to trigger the CSS slide animation
    navMenu.classList.toggle("active");
  });
}

// SCROLL REVEAL — PHILOSOPHY SECTION

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

// STAT COUNTER (Philosophy section)
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

// SHRINK NAVBAR ON SCROLL

const navbarEl = document.querySelector(".navbar");

if (navbarEl) {
  window.addEventListener("scroll", () => {
    navbarEl.classList.toggle("scrolled", window.scrollY > 50);
  });
}// === PHASE 8: SMART ADD TO CART ===

document.addEventListener("click", async (event) => {
  
  // 1. Check if the clicked element is our new smart button (or the icon inside it)
  const button = event.target.closest(".smart-add-to-cart-btn");
  
  if (button) {
    event.preventDefault(); 

    if (!currentUserUID) {
      alert("Please log in to add items to your cart!");
      window.location.href = "login.html";
      return;
    }

    // 2. Look "up" the HTML tree to find the specific product card wrapper
    const productCard = button.closest(".shop-card");

    // 3. Scrape the specific data from this card's HTML
    // We use .innerText and .src to grab what is visible on the screen
    const rawName = productCard.querySelector("h3").innerText;
    
    // We grab the price text (e.g., "4.99 /ea") and strip out everything except numbers and decimals
    const rawPriceText = productCard.querySelector(".price").innerText;
    const cleanPrice = parseFloat(rawPriceText.replace(/[^0-9.]/g, '')); 
    
    const rawImage = productCard.querySelector("img").src;

    // Create a unique ID by removing spaces and making the name lowercase
    const generatedId = "prod_" + rawName.replace(/\s+/g, '').toLowerCase();

    // 4. Build the data object
    const productData = {
      id: generatedId,
      name: rawName,
      price: cleanPrice,
      image: rawImage,
      quantity: 1
    };

    // 5. Send it to Firestore
    try {
      const cartRef = doc(db, "carts", currentUserUID);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        await updateDoc(cartRef, { items: arrayUnion(productData) });
      } else {
        await setDoc(cartRef, { items: [productData] });
      }
      alert(productData.name + " was successfully added to your cart!");
    } catch (error) {
      console.error("Firestore Error: ", error);
      alert("Failed to add to cart. Check your browser console.");
    }
  }
});


// === PHASE 9 & 10: DYNAMIC CART, MATH & RAZORPAY CHECKOUT ===
const cartContainer = document.getElementById("cart-items-container");
const checkoutBtn = document.querySelector(".checkout-btn"); 

// This holds the cart data globally so the checkout button can access it
let currentCartItems = []; 

if (cartContainer) {
  // 1. Fetch Cart from Database on Page Load
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const cartRef = doc(db, "carts", user.uid);
        const cartSnap = await getDoc(cartRef);
        
        if (cartSnap.exists() && cartSnap.data().items.length > 0) {
          currentCartItems = cartSnap.data().items;
          renderCart(currentCartItems);
        } else {
          showEmptyCart();
        }
      } catch (error) {
        cartContainer.innerHTML = `<p class="empty-cart-msg">Error loading cart.</p>`;
      }
    } else {
      cartContainer.innerHTML = `<p class="empty-cart-msg">Please <a href="login.html">log in</a>.</p>`;
    }
  });

  // 2. The Engine: Injects HTML and perfectly calculates the Bill
  function renderCart(itemsArray) {
    cartContainer.innerHTML = "";
    let subtotal = 0;

    itemsArray.forEach((item, index) => {
      const itemQuantity = item.quantity || 1;
      const itemTotal = item.price * itemQuantity;
      subtotal += itemTotal;

      // Notice we are forcing the ₹ symbol on all items here
      cartContainer.innerHTML += `
        <div class="cart-item" data-index="${index}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <span class="cart-item-price">₹${item.price.toFixed(2)}</span>
            </div>
            <div class="cart-item-qty">
                <button class="qty-btn minus-btn">−</button>
                <span class="qty-value">${itemQuantity}</span>
                <button class="qty-btn plus-btn">+</button>
            </div>
            <div class="cart-item-total">₹${itemTotal.toFixed(2)}</div>
            <button class="remove-btn" aria-label="Remove"><i class="fa-solid fa-xmark"></i></button>
        </div>
      `;
    });

    const formattedSubtotal = "₹" + subtotal.toFixed(2);
    document.getElementById("cart-subtotal").innerText = formattedSubtotal;
    document.getElementById("cart-total").innerText = formattedSubtotal;
  }

  // 3. Helper to clear the screen
  function showEmptyCart() {
    cartContainer.innerHTML = `<p class="empty-cart-msg">Your cart is empty.</p>`;
    document.getElementById("cart-subtotal").innerText = "₹0.00";
    document.getElementById("cart-total").innerText = "₹0.00";
    currentCartItems = [];
  }

  // 4. Handle Fast +, -, and x clicks
  cartContainer.addEventListener("click", async (event) => {
    if (!currentUserUID) return;

    const cartItemEl = event.target.closest(".cart-item");
    if (!cartItemEl) return; 

    const index = parseInt(cartItemEl.getAttribute("data-index"));
    const cartRef = doc(db, "carts", currentUserUID);
    let needsUpdate = false;

    if (event.target.closest(".remove-btn")) {
      currentCartItems.splice(index, 1);
      needsUpdate = true;
    } else if (event.target.closest(".plus-btn")) {
      currentCartItems[index].quantity = (currentCartItems[index].quantity || 1) + 1;
      needsUpdate = true;
    } else if (event.target.closest(".minus-btn")) {
      if (currentCartItems[index].quantity > 1) {
        currentCartItems[index].quantity -= 1;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      if (currentCartItems.length === 0) showEmptyCart();
      else renderCart(currentCartItems);
      
      await updateDoc(cartRef, { items: currentCartItems });
    }
  });
}

// 5. Razorpay Checkout Connection (Now cleanly separated!)
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", async () => {
    if (!currentUserUID || currentCartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    checkoutBtn.innerText = "Processing..."; 

    try {
      const response = await fetch("http://localhost:3000/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: currentCartItems }) 
      });

      const data = await response.json();

      if (response.ok) {
     const options = {
    "key": "rzp_test_TZDUKoDeiDIslM", 
    "amount": data.amount,
    "currency": "INR",
    "name": "Tulsi Traders",
    "description": "Organic Produce",
    "order_id": data.orderId,
    "prefill": {
        "email": auth.currentUser ? auth.currentUser.email : "",
        "contact": "9999999999"  
    },
    "handler": async function (response) {
        alert("Payment Successful! ID: " + response.razorpay_payment_id);
        const cartRef = doc(db, "carts", currentUserUID);
        await updateDoc(cartRef, { items: [] });
        window.location.reload();
    },
    "theme": { "color": "#0B5C46" }
};
        const rzp = new window.Razorpay(options);
        console.log("Razorpay options:", options);
        rzp.open();
        checkoutBtn.innerText = "Proceed to Checkout";
      } else {
        alert("Error: " + data.error);
        checkoutBtn.innerText = "Proceed to Checkout";
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Cannot connect to Node.js backend. Is your server.js running?");
      checkoutBtn.innerText = "Proceed to Checkout";
    }
  });
}