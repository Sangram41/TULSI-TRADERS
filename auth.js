// 1. IMPORT FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, doc, setDoc, getDoc, arrayUnion, arrayRemove, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
// 2. CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBi3NuEGxFg9prR-EHmKuAIs_a4pCEzKcE",
  authDomain: "tulsi-traders-482a5.firebaseapp.com",
  projectId: "tulsi-traders-482a5",
  storageBucket: "tulsi-traders-482a5.firebasestorage.app",
  messagingSenderId: "677454540523",
  appId: "1:677454540523:web:04293e179692b3b0c0d8ae",
  measurementId: "G-KEBM4M16ZJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// 3. WATCH AUTH STATE
export let currentUserUID = null;
const loginNavItem = document.getElementById("login-nav-item");
const logoutNavItem = document.getElementById("logout-nav-item");
const logoutBtn = document.getElementById("logout-btn"); 
const userEmailDisplay = document.getElementById("user-email-display");

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserUID = user.uid;
    if (loginNavItem) loginNavItem.style.display = "none";
    if (logoutNavItem) logoutNavItem.style.display = "block";
    if (userEmailDisplay) userEmailDisplay.innerText = user.email;
  } else {
    currentUserUID = null;
    if (loginNavItem) loginNavItem.style.display = "block";
    if (logoutNavItem) logoutNavItem.style.display = "none";
  }
});

if (logoutBtn) {
  logoutBtn.addEventListener("click", function(event) {
    event.preventDefault(); 
    signOut(auth).then(() => {
      showToast("You have been safely logged out.", "success");
      window.location.href = "TULSI1.html"; 
    }).catch((error) => {
      alert("Error logging out: " + error.message);
    });
  });
}

// 4. SIGN UP
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", function(event) {
    event.preventDefault(); 
    const userEmail = document.getElementById("email").value;
    const userPassword = document.getElementById("password").value;
    createUserWithEmailAndPassword(auth, userEmail, userPassword)
      .then((userCredential) => {
        showToast("Account created successfully! Welcome to Tulsi Traders.", "success");
        window.location.href = "TULSI1.html";
      })
      .catch((error) => {
        showToast("Oops! " + error.message, "error");
      });
  });
}

// 5. SIGN IN
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", function(event) {
    event.preventDefault(); 
    const userEmail = document.getElementById("email").value;
    const userPassword = document.getElementById("password").value;
    signInWithEmailAndPassword(auth, userEmail, userPassword)
      .then((userCredential) => {
        showToast("Welcome back to Tulsi Traders!", "success");
        window.location.href = "TULSI1.html";
      })
      .catch((error) => {
        showToast("Login failed! Please check your email and password.", "error");
      });
  });
}

// 6. GOOGLE LOGIN
const googleBtn = document.getElementById("google-btn");
const provider = new GoogleAuthProvider();
if (googleBtn) {
  googleBtn.addEventListener("click", function() {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        showToast("Welcome, " + user.displayName + "!", "success");
        window.location.href = "TULSI1.html"; 
      })
      .catch((error) => {
        showToast("Google sign-in failed. Check console for details.", "error");
      });
  });
}

// 7. GITHUB LOGIN
const githubBtn = document.getElementById("github-btn");
const githubProvider = new GithubAuthProvider();
if (githubBtn) {
  githubBtn.addEventListener("click", function() {
    signInWithPopup(auth, githubProvider)
      .then((result) => {
        const user = result.user;
        showToast("Welcome, " + user.displayName + "!", "success");
        window.location.href = "TULSI1.html"; 
      })
      .catch((error) => {
        showToast("GitHub sign-in failed. " + error.message, "error");
      });
  });
}

// 8. SMART ADD TO CART
document.addEventListener("click", async (event) => {
  const button = event.target.closest(".smart-add-to-cart-btn");
  if (button) {
    event.preventDefault(); 
    if (!currentUserUID) {
      showToast("Please log in to add items to your cart!", "error");
      window.location.href = "login.html";
      return;
    }
    const productCard = button.closest(".shop-card");
    const rawName = productCard.querySelector("h3").innerText;
    const rawPriceText = productCard.querySelector(".price").innerText;
    const cleanPrice = parseFloat(rawPriceText.replace(/[^0-9.]/g, '')); 
    const rawImage = productCard.querySelector("img").src;
    const generatedId = "prod_" + rawName.replace(/\s+/g, '').toLowerCase();

    const productData = {
      id: generatedId,
      name: rawName,
      price: cleanPrice,
      image: rawImage,
      quantity: 1
    };

    try {
      const cartRef = doc(db, "carts", currentUserUID);
      const cartSnap = await getDoc(cartRef);
      if (cartSnap.exists()) {
        await updateDoc(cartRef, { items: arrayUnion(productData) });
      } else {
        await setDoc(cartRef, { items: [productData] });
      }
      showToast(productData.name + " was successfully added to your cart!", "success");
    } catch (error) {
      showToast("Failed to add to cart.", "error");
    }
  }
});

// 9. DYNAMIC CART & QR CODE
const cartContainer = document.getElementById("cart-items-container");
let currentCartItems = []; 

if (cartContainer) {
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

  function renderCart(itemsArray) {
    cartContainer.innerHTML = "";
    let subtotal = 0;
    itemsArray.forEach((item, index) => {
      const itemQuantity = item.quantity || 1;
      const itemTotal = item.price * itemQuantity;
      subtotal += itemTotal;
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
    generateUPIQRCode(subtotal);
  }

  function showEmptyCart() {
    cartContainer.innerHTML = `<p class="empty-cart-msg">Your cart is empty.</p>`;
    document.getElementById("cart-subtotal").innerText = "₹0.00";
    document.getElementById("cart-total").innerText = "₹0.00";
    currentCartItems = [];
    generateUPIQRCode(0);
  }

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

function generateUPIQRCode(finalTotal) {
    const myUPI_ID = "9325586418@fam"; 
    const storeName = "Tulsi Traders";
    const upiLinkTag = document.getElementById('upi-link');
    const qrImage = document.getElementById('upi-qr-code');
    const qrInstruction = document.getElementById('qr-instruction');
    const qrEmptyMsg = document.getElementById('qr-empty-msg');

    if (upiLinkTag && qrImage && qrInstruction && qrEmptyMsg) {
        if (finalTotal > 0) {
            const upiString = `upi://pay?pa=${myUPI_ID}&pn=${encodeURIComponent(storeName)}&am=${finalTotal}&cu=INR`;
            const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;
            qrImage.src = qrApiUrl;
            upiLinkTag.href = upiString; 
            qrInstruction.innerText = `Pay exactly ₹${finalTotal.toFixed(2)}`;
            upiLinkTag.style.display = "block";
            qrEmptyMsg.style.display = "none";
        } else {
            upiLinkTag.style.display = "none";
            qrEmptyMsg.style.display = "block";
        }
    }
}// 10. COMMUNITY COMMENTS LOGIC (SECURE LIKES, AUTO-NAME & HOME PAGE TOP 3)
document.addEventListener("DOMContentLoaded", () => {
    const commentForm = document.getElementById('comment-form');
    const commentsFeed = document.getElementById('comments-feed');
    const topCommentsContainer = document.getElementById('top-3-comments'); 

    const renderStars = (rating) => {
        let starsHtml = '<div class="stars" style="color: #d9c98a; margin-bottom: 10px;">';
        for (let i = 1; i <= 5; i++) {
            starsHtml += i <= rating ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
        }
        starsHtml += '</div>';
        return starsHtml;
    };

    // --- 1. COMMUNITY PAGE: LOAD ALL COMMENTS ---
    if (commentForm && commentsFeed) {
        const loadComments = async () => {
            commentsFeed.innerHTML = 'Loading community voices...';
            const q = query(collection(db, "community_comments"), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);
            
            commentsFeed.innerHTML = '';
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const rating = data.rating || 5; 
                const likedBy = data.likedBy || [];
                // We pull the number for the UI
                const likesCount = data.likesCount || 0; 
                
                const hasLiked = currentUserUID ? likedBy.includes(currentUserUID) : false;
                
                commentsFeed.innerHTML += `
                    <div class="testimonial-card" style="background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                        ${renderStars(rating)}
                        <p style="font-style: italic; color: #5c6a60; margin-bottom: 15px;">"${data.text}"</p>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong style="color: #0B5C46;">@${data.name}</strong>
                            <button class="like-btn ${hasLiked ? 'liked' : ''}" data-id="${docSnap.id}">
                                <i class="${hasLiked ? 'fa-solid' : 'fa-regular'} fa-heart" style="color: ${hasLiked ? '#e63946' : ''}"></i> 
                                <span class="like-count">${likesCount}</span>
                            </button>
                        </div>
                    </div>
                `;
            });
        };

        commentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!auth.currentUser) {
                if(window.showToast) showToast("Please log in to post a comment!", "error");
                return;
            }

            const btn = this.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Posting... <i class="fa-solid fa-spinner fa-spin"></i>';
            
            let autoName = "User";
            if (auth.currentUser.displayName) {
                autoName = auth.currentUser.displayName.split(' ')[0]; 
            } else if (auth.currentUser.email) {
                autoName = auth.currentUser.email.split('@')[0]; 
            }
            
            const text = document.getElementById('comment-text').value;
            const ratingElement = document.querySelector('input[name="rating"]:checked');
            const rating = ratingElement ? parseInt(ratingElement.value) : 5;

            try {
                await addDoc(collection(db, "community_comments"), {
                    name: autoName,
                    text: text,
                    rating: rating,
                    likedBy: [], 
                    likesCount: 0, // NEW: We must save a number so the Home Page can sort by it!
                    timestamp: serverTimestamp()
                });
                this.reset();
                document.getElementById('star5').checked = true;
                if(window.showToast) showToast("Review posted successfully!");
                btn.innerHTML = 'Posted! <i class="fa-solid fa-check"></i>';
                setTimeout(() => btn.innerHTML = originalText, 2000);
                loadComments(); 
            } catch (error) {
                if(window.showToast) showToast("Error posting review.", "error");
            }
        });
        
        setTimeout(loadComments, 800);
    }

    // --- 2. HOME PAGE: LOAD TOP 3 LIKED COMMENTS ---
    if (topCommentsContainer) {
        const loadTopComments = async () => {
            try {
                // Firebase sorts by our new 'likesCount' number field
                const q = query(collection(db, "community_comments"), orderBy("likesCount", "desc"), limit(3));
                const querySnapshot = await getDocs(q);
                
                topCommentsContainer.innerHTML = '';
                querySnapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    const rating = data.rating || 5;
                    
                    topCommentsContainer.innerHTML += `
                        <div class="testimonial-card" style="background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                            ${renderStars(rating)}
                            <p style="color: #5c6a60; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">"${data.text}"</p>
                            <div class="testimonial-author">
                                <strong style="color: #0B5C46; display: block;">@${data.name}</strong>
                                <span style="color: #e63946; font-size: 12px; font-weight: bold; margin-top: 5px; display: block;">
                                    <i class="fa-solid fa-heart"></i> ${data.likesCount || 0} Likes
                                </span>
                            </div>
                        </div>
                    `;
                });
            } catch (error) {
                console.error("Error loading top comments:", error);
            }
        };
        setTimeout(loadTopComments, 800);
    }
});

// --- 3. GLOBAL SECURE LIKE BUTTON ---
document.addEventListener("click", async (e) => {
    const likeBtn = e.target.closest(".like-btn");
    if (likeBtn) {
        e.preventDefault();
        
        if (!currentUserUID) {
            if(window.showToast) showToast("Please log in to like comments!", "error");
            return;
        }

        const commentId = likeBtn.getAttribute("data-id");
        const icon = likeBtn.querySelector("i");
        const countSpan = likeBtn.querySelector(".like-count");
        const commentRef = doc(db, "community_comments", commentId);
        
        const isCurrentlyLiked = likeBtn.classList.contains("liked");
        let currentCount = parseInt(countSpan.innerText) || 0;

        if (isCurrentlyLiked) {
            // UN-LIKE LOGIC
            likeBtn.classList.remove("liked");
            icon.classList.remove("fa-solid");
            icon.classList.add("fa-regular");
            icon.style.color = "";
            countSpan.innerText = currentCount - 1;
            
            // Updates both the Array and the Number field in Firebase simultaneously
            await updateDoc(commentRef, { 
                likedBy: arrayRemove(currentUserUID),
                likesCount: increment(-1) 
            });
        } else {
            // LIKE LOGIC
            likeBtn.classList.add("liked");
            icon.classList.remove("fa-regular");
            icon.classList.add("fa-solid");
            icon.style.color = "#e63946";
            countSpan.innerText = currentCount + 1;
            
            await updateDoc(commentRef, { 
                likedBy: arrayUnion(currentUserUID),
                likesCount: increment(1) 
            });
        }
    }
});
// --- GLOBAL LIKE BUTTON CLICK LISTENER ---
document.addEventListener("click", async (e) => {
    const likeBtn = e.target.closest(".like-btn");
    if (likeBtn) {
        e.preventDefault();
        
        // Prevent users from spam-clicking the like button
        if (likeBtn.classList.contains("liked")) return;
        likeBtn.classList.add("liked");

        const commentId = likeBtn.getAttribute("data-id");
        const icon = likeBtn.querySelector("i");
        const countSpan = likeBtn.querySelector(".like-count");
        
        // Instant visual update (Optimistic UI)
        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid");
        icon.style.color = "#e63946";
        countSpan.innerText = parseInt(countSpan.innerText) + 1;

        try {
            // Update the database securely
            const commentRef = doc(db, "community_comments", commentId);
            await updateDoc(commentRef, { likes: increment(1) });
        } catch (error) {
            console.error("Failed to like:", error);
        }
    }
});

// === CUSTOM TOAST NOTIFICATION ENGINE ===
window.showToast = function(message, type = "success") {
    // 1. Create the container if it doesn't exist yet
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    // 2. Create the notification box
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    // 3. Choose the right icon (Checkmark for success, Alert for error)
    const icon = type === "success" ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-circle-exclamation"></i>';
    toast.innerHTML = `${icon} <span>${message}</span>`;

    // 4. Put it on the screen
    container.appendChild(toast);

    // 5. Automatically delete it from the code after 4 seconds so it doesn't clutter the page
    setTimeout(() => {
        toast.remove();
    }, 4000);
};