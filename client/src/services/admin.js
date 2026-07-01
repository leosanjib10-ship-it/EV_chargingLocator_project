import api from './api.js';

export const fetchOverview = () =>
  api.get('/admin/overview').then((r) => r.data.data);

export const fetchAllUsers = (params = {}) =>
  api.get('/users', { params: { limit: 1000, ...params } }).then((r) => r.data.data.users);

export const fetchAllStations = (params = {}) =>
  api.get('/stations', { params: { limit: 1000, ...params } }).then((r) => r.data.data.stations);
