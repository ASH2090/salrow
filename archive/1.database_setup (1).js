// database_setup.js

// This script initializes a Firestore database with collections and sample data
// based on the provided ER diagram.

const db = require("./index"); // Assuming your Firebase admin initialization is in index.js
const { Timestamp } = require("firebase-admin/firestore");

async function setupDatabase() {
  console.log("Starting database setup...");

  try {
    // 1. USERS Collection
    const userRef = db.collection("users").doc("user_001");
    await userRef.set({
      email: "test@example.com",
      role: "admin",
      created_at: Timestamp.now(),
    });
    console.log("Created user: user_001");

    // 2. DEVICES Collection
    const deviceRef = db.collection("devices").doc("device_001");
    await deviceRef.set({
      user_id: userRef.id,
      platform: "ios",
      push_token: "example_push_token",
      last_seen: Timestamp.now(),
    });
    console.log("Created device: device_001");

    // 3. VEHICLES Collection
    const vehicleRef = db.collection("vehicles").doc("vehicle_001");
    await vehicleRef.set({
      owner_user_id: userRef.id,
      type: "truck",
      plate_number: "TRUCK-001",
      agency: "Logistics Inc.",
    });
    console.log("Created vehicle: vehicle_001");

    // 4. ROUTES Collection
    const routeRef = db.collection("routes").doc("route_001");
    await routeRef.set({
      vehicle_id: vehicleRef.id,
      polyline: [
        { lat: 34.0522, lon: -118.2437 }, // Los Angeles
        { lat: 36.1699, lon: -115.1398 }, // Las Vegas
      ],
      start_time: Timestamp.now(),
      status: "in_progress",
    });
    console.log("Created route: route_001");

    // 5. POSITIONS Sub-collection (nested under a route)
    const positionRef = routeRef.collection("positions").doc("position_001");
    await positionRef.set({
      point: { lat: 34.1522, lon: -118.2437 }, // A point along the route
      speed: 65.5,
      heading: 45.0,
      ts: Timestamp.now(),
    });
    console.log("Created position: position_001 for route_001");

    // 6. GEOFENCES Collection
    const geofenceRef = db.collection("geofences").doc("geofence_001");
    await geofenceRef.set({
      route_id: routeRef.id,
      polygon: [
        { lat: 34.0, lon: -118.0 },
        { lat: 34.1, lon: -118.0 },
        { lat: 34.1, lon: -118.1 },
        { lat: 34.0, lon: -118.1 },
      ],
      buffer_meters: 500,
      expires_at: Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
    });
    console.log("Created geofence: geofence_001");

    // 7. ALERTS Collection
    const alertRef = db.collection("alerts").doc("alert_001");
    await alertRef.set({
      route_id: routeRef.id,
      target_user_id: userRef.id,
      type: "geofence_enter",
      state: "OLD",
      sent_at: null, // Not sent yet
    });
    console.log("Created alert: alert_001");

    console.log("\nDatabase setup complete. ✅");
  } catch (error) {
    console.error("\n❌ Error during database setup:", error);
  } finally {
      // It's good practice to exit the script, especially if it's a one-off task.
      // However, if the db connection is kept alive, you might not want to exit.
      // For a simple setup script, exiting is fine.
      process.exit();
  }
}

setupDatabase();
