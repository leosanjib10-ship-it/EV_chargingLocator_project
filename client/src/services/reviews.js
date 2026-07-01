import api from './api.js';

export const fetchStationReviews = (stationId, params = {}) =>
  api.get(`/reviews/station/${stationId}`, { params }).then((r) => r.data.data);

export const fetchMyReviews = (userId) =>
  api.get('/reviews', { params: { userId, limit: 100 } }).then((r) => r.data.data.reviews);

// All feedback left on stations owned by the current station owner (or, for
// admins, across every station on the platform).
export const fetchOwnerReviews = () =>
  api.get('/reviews/owner').then((r) => r.data.data);

export const fetchAllReviews = (params = {}) =>
  api.get('/reviews', { params: { limit: 1000, ...params } }).then((r) => r.data.data.reviews);

export const createReview = (data) =>
  api.post('/reviews', data).then((r) => r.data.data);

export const deleteReview = (id) =>
  api.delete(`/reviews/${id}`).then((r) => r.data.data);

export const replyToReview = (id, text) =>
  api.post(`/reviews/${id}/reply`, { text }).then((r) => r.data.data);
