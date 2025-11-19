// mock_backend/simulationEngine.js

let index = 0;

// Haversine distance (meters)
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const toRad = deg => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Return next point in route, loop when finished
function getNextPoint(routePoints) {
  if (!routePoints || routePoints.length === 0) {
    return null;
  }
  const point = routePoints[index];
  index = (index + 1) % routePoints.length; // loop
  return point;
}

// Filter alerts that are near current vehicle point
function getAlertsForPoint(point, alertsData, radiusMeters = 300) {
  if (!point) return [];
  return alertsData.filter(alert => {
    const d = getDistanceMeters(
      point.lat,
      point.lng,
      alert.lat,
      alert.lng
    );
    return d <= radiusMeters;
  });
}

module.exports = { getNextPoint, getAlertsForPoint };
