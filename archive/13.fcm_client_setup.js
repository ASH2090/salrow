
function getFcmToken() {
  // First, check if the browser supports service workers.
  if ('serviceWorker' in navigator) {
    // Register the service worker file using a RELATIVE path.
    navigator.serviceWorker.register('firebase-messaging-sw.js')
      .then((registration) => {
        console.log('Service Worker registered successfully with scope:', registration.scope);
        const messaging = firebase.messaging();

        // ADD THIS CODE to handle foreground messages
        messaging.onMessage((payload) => {
          console.log('Message received. ', payload);
          // Customize notification handling here
          alert(`New Notification:\nTitle: ${payload.notification.title}\nBody: ${payload.notification.body}`);
        });

        // Now that the service worker is registered, request permission.
        messaging.requestPermission()
          .then(() => {
            console.log('Notification permission granted.');
            // Get the token, passing in the service worker registration.
            return messaging.getToken({ serviceWorkerRegistration: registration });
          })
          .then((token) => {
            if (token) {
              console.log('FCM Registration Token:', token);
              alert('Token received! It is in the developer console and the prompt that will appear next.');
              prompt("Copy this FCM Registration Token:", token);
            } else {
              console.log('No registration token available. This can happen if permission is not granted.');
              alert('Could not get a token. Please ensure you have granted notification permissions.');
            }
          })
          .catch((err) => {
            console.error('An error occurred while retrieving the token.', err);
            alert('An error occurred while getting the token. Please check the developer console.');
          });
      })
      .catch((err) => {
        console.error('Service Worker registration failed:', err);
        alert('Failed to register the service worker, which is required for notifications. Check the console for errors.');
      });
  } else {
    alert('Service workers are not supported in this browser.');
  }
}

// Wait for the DOM to be fully loaded before trying to find the button.
document.addEventListener('DOMContentLoaded', () => {
  const fcmButton = document.getElementById('fcm-button');
  if (fcmButton) {
    fcmButton.addEventListener('click', getFcmToken);
  }
});
