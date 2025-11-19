// This is the required service worker file for Firebase Messaging.
// It must be in the root directory of your site.

// Import and initialize the Firebase SDK.
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Your Firebase project configuration.
const firebaseConfig = {
  apiKey: "AIzaSyCJbO7BNbwO7_120HFE5g80PyTW1AyeL0Q",
  authDomain: "salrow-aa320.firebaseapp.com",
  projectId: "salrow-aa320",
  storageBucket: "salrow-aa320.firebasestorage.app",
  messagingSenderId: "830794805081",
  appId: "1:830794805081:web:b6880f31c3d232e648"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();
