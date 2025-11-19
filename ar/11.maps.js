/**
 * Firebase configuration
 */
const firebaseConfig = {
  apiKey: "AIzaSyCJbO7BNbwO7_120HFE5g80PyTW1AyeL0Q",
  authDomain: "salrow-aa320.firebaseapp.com",
  projectId: "salrow-aa320",
  storageBucket: "salrow-aa320.firebasestorage.app",
  messagingSenderId: "830794805081",
  appId: "1:830794805081:web:b6880f31c3d232e648"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let map;
let routePath;
let marker;
let accuracyRadius; // Variable for the new circle

// Define initMap globally so Google Maps API can call it.
window.initMap = async function () {
  try {
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    const initialPosition = { lat: 34.0522, lng: -118.2437 };

    map = new Map(document.getElementById('map'), {
      zoom: 12,
      center: initialPosition,
      mapId: 'DEMO_MAP_ID'
    });

    routePath = new google.maps.Polyline({
      path: [],
      geodesic: true,
      strokeColor: '#0000FF',
      strokeOpacity: 1.0,
      strokeWeight: 5
    });

    routePath.setMap(map);

    const sosImg = document.createElement('img');
    sosImg.src = 'SOS_Sarlow.webp'; // Corrected image path
    sosImg.style.width = '32px';
    sosImg.style.height = '32px';

    marker = new AdvancedMarkerElement({
      map: map,
      position: initialPosition,
      content: sosImg
    });

    // --- Add the accuracy radius circle ---
    accuracyRadius = new google.maps.Circle({
      strokeColor: '#87CEEB', // Light Sky Blue
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#87CEEB',
      fillOpacity: 0.50,
      map: map,
      center: initialPosition,
      radius: 500 // Radius in meters
    });

    // Listen for real-time updates from Firestore.
    db.collection('dummy-livelocation').orderBy('timestamp').onSnapshot(snapshot => {
      const all_points = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        all_points.push(new google.maps.LatLng(data.location.latitude, data.location.longitude));
      });

      routePath.setPath(all_points);

      if (all_points.length > 0) {
        const lastLatLng = all_points[all_points.length - 1];
        // Update both marker and circle position
        marker.position = lastLatLng;
        accuracyRadius.setCenter(lastLatLng);
        map.panTo(lastLatLng);
      }
    });

  } catch (error) {
    console.error("Error initializing map:", error);
  }
};
