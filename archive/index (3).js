
const express = require('express');
const path = require('path');
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// --- Firestore Initialization ---
// This part of the code initializes the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
console.log("✅ Firestore connection ready!");

// --- Web Server ---
// This part of the code starts a web server to show your HTML file.
const app = express();
const port = process.env.PORT || 3000;

// Serve static files (like index.html) from the project root
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`✅ Web server started. Open your browser to see the preview.`);
});

// Export the db object so other scripts (like your fcm_notifier) can require it
module.exports = db;
