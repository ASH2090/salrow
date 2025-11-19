// mock_backend/dataLoader.js

const fs = require("fs");
const path = require("path");

function loadJSON(filename) {
  const filePath = path.join(__dirname, "data", filename);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function loadData() {
  console.log("📥 Loading mock data...");
  const routePoints = loadJSON("route.json");   // array of {lat, lng, ...}
  const alertsData = loadJSON("alerts.json");   // array of {id, lat, lng, type, ...}
  console.log("✅ Mock data loaded.");
  return { routePoints, alertsData };
}

module.exports = { loadData };
