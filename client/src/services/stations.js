import api from './api.js';

export const fetchStations = (params = {}) =>
  api.get('/stations', { params }).then((r) => r.data.data);

export const fetchStation = (id) =>
  api.get(`/stations/${id}`).then((r) => r.data.data);

export const fetchStationLive = (id) =>
  api.get(`/stations/${id}/live`).then((r) => r.data.data);

export const fetchMyStations = () =>
  api.get('/stations/operator/me').then((r) => r.data.data);

export const createStation = (data) =>
  api.post('/stations', data).then((r) => r.data.data);

export const updateStation = (id, data) =>
  api.put(`/stations/${id}`, data).then((r) => r.data.data);

export const deleteStation = (id) =>
  api.delete(`/stations/${id}`).then((r) => r.data.data);

export const fetchNearbyStations = (lat, lon, maxDistance = 50) =>
  api.get('/stations/nearby', { params: { latitude: lat, longitude: lon, maxDistance } }).then((r) => r.data.data);

export const createCharger = (data) =>
  api.post('/chargers', data).then((r) => r.data.data);

export const updateCharger = (id, data) =>
  api.put(`/chargers/${id}`, data).then((r) => r.data.data);

export const deleteCharger = (id) =>
  api.delete(`/chargers/${id}`).then((r) => r.data.data);

export const updatePortStatus = (portId, availability) =>
  api.patch(`/chargers/${portId}/status`, { availability }).then((r) => r.data.data);

export const fetchStationPorts = (stationId) =>
  api.get(`/chargers/station/${stationId}`, { params: { limit: 50 } }).then((r) => r.data.data.ports);
