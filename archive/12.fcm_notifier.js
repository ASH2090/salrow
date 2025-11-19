
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// --- IMPORTANT ---
// This is a placeholder. You MUST replace it with a valid FCM registration token.
const registrationToken = 'eRnW7nXVjIQvnpa6BLPIXr:APA91bH96ytZBzTkvj9-C8FBa3PbpLuWDR_WotWsGBvLXUBMJIadO1SId6mVCFwJltUtkyjNoths2mDcFPQ7SRVJDdy3-JnMTdI2-lbs2zpCSrlI7aBUWRc';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  name: 'fcmNotifierApp'
});

const db = admin.firestore();
const messaging = admin.messaging();
const collectionToWatch = 'dummy-livelocation';

async function sendNotification(point) {
  console.log('Sending FCM notification...');
  const payload = {
    notification: {
      title: 'Emergency Alert',
      body: `An Emergency vehicle is approaching you from (${point.lat.toFixed(4)}, ${point.lon.toFixed(4)})`
    },
    token: registrationToken
  };

  try {
    const response = await messaging.send(payload);
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

/**
 * Listens for new documents and uses a simple in-memory counter
 * to send notifications every 10 points.
 */
function startListener() {
  console.log(`Listening for new documents in '${collectionToWatch}'...`);

  if (registrationToken.includes('YOUR_REGISTRATION_TOKEN_HERE')) {
    console.error('\n❌ ERROR: Please replace the placeholder registrationToken in this script.');
    return;
  }

  // Use a simple counter in memory. It will reset when the script restarts.
  let pointCounter = 0;

  db.collection(collectionToWatch).onSnapshot(snapshot => {
    snapshot.docChanges().forEach(async change => {
      if (change.type === 'added') {
        pointCounter++; // Increment for each new document
        console.log(`New document detected. In-memory counter: ${pointCounter}`);

        // Check if the in-memory counter is a multiple of 10
        if (pointCounter > 0 && pointCounter % 10 === 0) {
          console.log(`Counter hit ${pointCounter}. Triggering notification.`);
          const newData = change.doc.data();
          const location = newData.location; // Correctly look for the 'location' field

          if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
            // Adapt the data structure for the sendNotification function
            const point = {
              lat: location.latitude,
              lon: location.longitude
            };
            await sendNotification(point);
          } else {
            console.error(`Document ${change.doc.id} is missing valid location data (latitude/longitude).`);
          }
        }
      }
    });
  }, err => {
    console.error('Listen failed:', err);
  });
}

// Start the listener
startListener();
