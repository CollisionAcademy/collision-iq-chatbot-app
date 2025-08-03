import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCuk5HQtsifYS0PBbZUDTnNliEu0KPlSUI",
  authDomain: "collision-iq-chatbot-fa1ca.firebaseapp.com",
  projectId: "collision-iq-chatbot-fa1ca",
  storageBucket: "collision-iq-chatbot-fa1ca.firebasestorage.app",
  messagingSenderId: "39173455666",
  appId: "1:39173455666:web:5817fa50d9642dd7eb612b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let uid = null;

signInAnonymously(auth).then(() => {
  document.getElementById('status').innerText = "✅ Connected to Firebase";
});

onAuthStateChanged(auth, user => {
  if (user) {
    uid = user.uid;
    listenForMessages();
  }
});

async function sendMessage() {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  if (!text) return;

  // Store user's message
  await addDoc(collection(db, "messages"), {
    uid,
    text,
    timestamp: Date.now()
  });

  input.value = '';

  // Fetch Gemini reply
  try {
    const response = await fetch('https://getgeminireply-k1r24rhapq-uc.a.run.app', { // ✅ use full deployed URL
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });

    const data = await response.json();
    const reply = data.reply;

    if (reply) {
      // Store bot's response
      await addDoc(collection(db, "messages"), {
        uid: 'bot',
        text: reply,
        timestamp: Date.now()
      });
    }
  } catch (err) {
    console.error('Gemini fetch error:', err);
  }
}

function listenForMessages() {
  const q = query(collection(db, "messages"), orderBy("timestamp"));
  onSnapshot(q, snapshot => {
    const container = document.getElementById('messages');
    container.innerHTML = '';
    snapshot.forEach(doc => {
      const msg = doc.data();
      const el = document.createElement('div');
      el.className = 'msg';
      el.innerHTML = `<span class="${msg.uid === uid ? 'user' : msg.uid === 'bot' ? 'bot' : 'other'}">
        ${msg.uid === uid ? 'You' : msg.uid === 'bot' ? 'Bot' : 'Other'}:
        </span> ${msg.text}`;
      container.appendChild(el);
      container.scrollTop = container.scrollHeight;
    });
  });
}

document.getElementById('sendBtn').addEventListener('click', sendMessage);
