const fs = require("fs");
const path = require("path");

let routeIndex = 0;

/**
 * Load JSON from mock_backend/data/
 */
function loadJSON(filename) {
  try {
    const filePath = path.join(__dirname, "data", filename);
    const raw = fs.readFileSync(filePath, "utf8");

    if (!raw.trim()) {
      console.warn(`⚠ ${filename} is empty — returning []`);
      return [];
    }

    return JSON.parse(raw);
  } catch (err) {
    console.error(`❌ Failed to load ${filename}: ${err.message}`);
    return [];
  }
}

/**
 * Load all mock data sets
 */
function loadData() {
  const routePoints = loadJSON("route.json");
  const alertsData = loadJSON("alerts.json");

  return { routePoints, alertsData };
}

/**
 * Return 1 GPS point at a time to simulate live movement
 */
function getNextLivePoint() {
  const { routePoints } = loadData();

  if (!routePoints.length) {
    return { error: "No route data available" };
  }

  // Loop back after reaching end
  const point = routePoints[routeIndex];
  routeIndex = (routeIndex + 1) % routePoints.length;

  return {
    lat: point.lat,
    lng: point.lng,
    index: routeIndex
  };
}

module.exports = {
  loadData,
  getNextLivePoint
};
