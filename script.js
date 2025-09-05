// script.js
// ====== FIREBASE SETUP ======
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc,
    setDoc,
    updateDoc,
    increment,
    getDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// --------- EDIT: masukkan konfigurasi Firebase-mu di bawah ini ----------
const firebaseConfig = {
    apiKey: "AIzaSyA0GfDI34zSLtX55Z0ETeeVNcdZYQsi2lE",
    authDomain: "hyungers-yan.firebaseapp.com",
    projectId: "hyungers-yan",
    storageBucket: "hyungers-yan.firebasestorage.app",
    messagingSenderId: "317469791502",
    appId: "1:317469791502:web:0850f9e20e3e9c619b335f",
};
//

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// ====== DOM REFERENCES ======
const el = (s) => document.querySelector(s);

const clockEl = el("[data-clock]");
const statsTotalEl = el("[data-stats-total]");

const loginArea = el("[data-login-area]");
const loginBtn = el("[data-login-google]");
const commentArea = el("[data-comment-area]");
const commentForm = el("[data-comment-form]");
const commentInput = el("[data-comment-input]");
const commentListEl = el("[data-comment-list]");
const userNameEl = el("[data-user-name]");
const userAvatarEl = el("[data-user-avatar]");
const logoutBtn = el("[data-logout]");

// ====== CLOCK ======
function startClock() {
    function update() {
        const now = new Date();
        const parts = now.toLocaleTimeString([], { hour12: false });
        if (clockEl) clockEl.textContent = parts;
    }
    update();
    setInterval(update, 1000);
}
startClock();

// ====== VISITOR COUNTER ======
async function incrementVisitorTotal() {
    const statsDocRef = doc(db, "stats", "visitors");
    const snap = await getDoc(statsDocRef);

    if (!snap.exists()) {
        await setDoc(statsDocRef, { total: 1 });
    } else {
        await updateDoc(statsDocRef, { total: increment(1) });
    }
}

function watchVisitorStats() {
    const statsDocRef = doc(db, "stats", "visitors");
    onSnapshot(statsDocRef, (snap) => {
        if (!snap.exists()) {
            statsTotalEl.textContent = "0";
            return;
        }
        statsTotalEl.textContent = snap.data().total ?? 0;
    });
}

incrementVisitorTotal().catch(console.error);
watchVisitorStats();

// ====== COMMENTS ======
let commentsUnsub = null;

function renderCommentItem(data) {
    const li = document.createElement("li");

    const name = document.createElement("div");
    name.style.fontWeight = "600";
    name.textContent = data.user || data.email || "Anon";

    const time = document.createElement("div");
    time.style.fontSize = "0.8rem";
    time.style.color = "#666";
    if (data.createdAt && data.createdAt.toDate) {
        time.textContent = new Date(data.createdAt.toDate()).toLocaleString();
    }

    const text = document.createElement("div");
    text.style.marginTop = "0.35rem";
    text.textContent = data.text || "";

    li.appendChild(name);
    li.appendChild(time);
    li.appendChild(text);
    return li;
}

function subscribeComments() {
    const q = query(collection(db, "comments"), orderBy("createdAt", "desc"));
    commentsUnsub = onSnapshot(q, (snapshot) => {
        commentListEl.innerHTML = "";
        snapshot.forEach((docSnap) => {
            const li = renderCommentItem(docSnap.data());
            commentListEl.appendChild(li);
        });
    });
}

async function sendComment(user, text) {
    if (!text.trim()) return;
    await addDoc(collection(db, "comments"), {
        user: user.displayName || user.email,
        email: user.email,
        avatar: user.photoURL || null,
        text: text.trim(),
        createdAt: serverTimestamp(),
    });
    commentInput.value = "";
}

// ====== AUTH ======
function showLoggedInUI(user) {
    loginArea.hidden = true;
    commentArea.hidden = false;
    userNameEl.textContent = user.displayName || user.email;

    if (user.photoURL) {
        userAvatarEl.src = user.photoURL;
        userAvatarEl.hidden = false;
    } else {
        userAvatarEl.hidden = true;
    }

    if (!commentsUnsub) subscribeComments();
}

function showLoggedOutUI() {
    loginArea.hidden = false;
    commentArea.hidden = true;
    userNameEl.textContent = "";
    userAvatarEl.hidden = true;

    if (!commentsUnsub) subscribeComments();
}

onAuthStateChanged(auth, (user) => {
    if (user) showLoggedInUI(user);
    else showLoggedOutUI();
});

loginBtn.addEventListener("click", async () => {
    try {
        await signInWithPopup(auth, provider);
    } catch (err) {
        console.error("login error:", err);
    }
});

logoutBtn.addEventListener("click", () => {
    signOut(auth).catch(console.error);
});

commentForm.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const user = auth.currentUser;
    if (!user) {
        alert("Login dengan Google dulu.");
        return;
    }
    await sendComment(user, commentInput.value);
});

// initial subscribe untuk tampilkan komentar publik
subscribeComments();
