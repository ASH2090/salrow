const express = require("express");
const cors = require("cors");
const path = require("path");
const { loadData, getNextLivePoint } = require("./dataLoader");

const app = express();
app.use(cors());
app.use(express.json());

// Load mock data
console.log(" Loading mock data...");
const { routePoints, alertsData } = loadData();
console.log(" Mock data loaded.");

// Health check
app.get("/", (req, res) => {
  res.json({ message: "SALROW mock backend running" });
});

// Route 1 — Get all alerts (accidents / EMS calls)
app.get("/alerts", (req, res) => {
  res.json(alertsData);
});

// Route 2 — Get full route data
app.get("/route", (req, res) => {
  res.json(routePoints);
});

// Route 3 — Live vehicle movement simulation
app.get("/live", (req, res) => {
  const livePoint = getNextLivePoint();
  res.json(livePoint);
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(` SALROW mock backend running at http://localhost:${PORT}`);
});
