require('dotenv').config();
const admin = require('firebase-admin');
const { Client } = require("@googlemaps/google-maps-services-js");
const serviceAccount = require('./serviceAccountKey.json');

// Polyline decoding function.
// This has been corrected to store the actual coordinate values, not functions.
const google = {
    maps: {
        geometry: {
            encoding: {
                decodePath: function(encodedPath) {
                    var len = encodedPath.length;
                    var index = 0;
                    var lat = 0;
                    var lng = 0;
                    var array = [];
                    while (index < len) {
                        var b;
                        var shift = 0;
                        var result = 0;
                        do {
                            b = encodedPath.charCodeAt(index++) - 63;
                            result |= (b & 0x1f) << shift;
                            shift += 5;
                        } while (b >= 0x20);
                        var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
                        lat += dlat;

                        shift = 0;
                        result = 0;
                        do {
                            b = encodedPath.charCodeAt(index++) - 63;
                            result |= (b & 0x1f) << shift;
                            shift += 5;
                        } while (b >= 0x20);
                        var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
                        lng += dlng;
                        
                        // FIX: Store the calculated value, not a function.
                        array.push({lat: lat * 1e-5, lng: lng * 1e-5});
                    }
                    return array;
                }
            }
        }
    }
};


// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const collectionName = 'dummy-livelocation';
const googleMapsClient = new Client({});

/**
 * Populates the 'dummy-livelocation' collection with a route from Google Maps Directions API.
 */
async function populateRoute() {
  console.log(`Starting to populate the '${collectionName}' collection...`);

  // Clear the collection before populating
  const snapshot = await db.collection(collectionName).get();
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  console.log('Previous data cleared.');

  try {
    const response = await googleMapsClient.directions({
      params: {
        origin: { lat: 41.4421, lng: -87.681310 }, // University Park
        destination: { lat: 41.8941, lng: -87.6026 }, // Navy Pier
        key: process.env.GOOGLE_MAPS_DIRECTIONS_API_KEY, // API key from .env file
        travelMode: 'DRIVING'
      },
      timeout: 1000, // milliseconds
    });

    const route = response.data.routes[0];
    if (!route) {
      console.error('No routes found.');
      return;
    }

    const overview_path = route.overview_polyline.points;
    const decodedPath = google.maps.geometry.encoding.decodePath(overview_path);

    console.log(`Route found with ${decodedPath.length} points. Populating Firestore...`);

    for (let i = 0; i < decodedPath.length; i++) {
      const point = decodedPath[i];
      await db.collection(collectionName).add({
        // FIX: Access .lat and .lng as properties, not functions.
        location: new admin.firestore.GeoPoint(point.lat, point.lng),
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Added point ${i + 1}/${decodedPath.length}: (${point.lat.toFixed(4)}, ${point.lng.toFixed(4)})`);
      // Wait for a second to simulate a live feed
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('Finished populating the route.');

  } catch (e) {
    console.error('Error fetching directions or populating route:', e);
  }
}

populateRoute().catch(error => {
  console.error("Error populating route:", error);
});