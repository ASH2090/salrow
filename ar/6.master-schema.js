module.exports = {
  users: {
    email: 'string',
    role: 'string',
    created_at: 'string'
  },
  devices: {
    user_id: 'string',
    platform: 'string',
    push_token: 'string',
    last_seen: 'string'
  },
  vehicles: {
    owner_user_id: 'string',
    type: 'string',
    plate_number: 'string',
    agency: 'string'
  },
  routes: {
    vehicle_id: 'string',
    polyline: 'object',
    start_time: 'string',
    status: 'string'
  },
  positions: {
    point: {
      lat: 'number',
      lon: 'number'
    },
    speed: 'number',
    heading: 'number',
    ts: 'string'
  },
  geofences: {
    route_id: 'string',
    polygon: 'object',
    buffer_meters: 'number',
    expires_at: 'string'
  },
  alerts: {
    route_id: 'string',
    target_user_id: 'string',
    type: 'string',
    state: 'string',
    sent_at: 'object'
  }
};