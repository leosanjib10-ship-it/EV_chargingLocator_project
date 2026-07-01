import { EvStation } from '../models/Station.js';
import { ChargerPort } from '../models/Charger.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// ─── Create Station ────────────────────────────────────────
export const createStation = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    address,
    location,
    photos,
    operatingHours,
    amenities,
    network,
    accessType,
    accessInstructions
  } = req.body;

  const operatorId = req.user._id;

  if (!name || !address || !location) {
    throw new ApiError(400, 'Missing required fields');
  }

  if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
    throw new ApiError(400, 'Invalid location coordinates [longitude, latitude]');
  }

  const station = await EvStation.create({
    operator: operatorId,
    name,
    description,
    address: {
      ...address,
      formatted: address.formatted || `${address.street}, ${address.city}, ${address.country || 'Nepal'}`
    },
    location: { type: 'Point', coordinates: location.coordinates },
    photos: photos || [],
    operatingHours: operatingHours || [],
    amenities: amenities || [],
    network,
    accessType: accessType || 'public',
    accessInstructions
  });

  const populatedStation = await EvStation.findById(station._id).populate('operator', 'name email phone');

  res.status(201).json(
    new ApiResponse(201, 'Station created successfully', populatedStation)
  );
});

// ─── Get All Stations ────────────────────────────────────────
export const getAllStations = asyncHandler(async (req, res) => {
  const { status, city, accessType, page = 1, limit = 10, search, latitude, longitude, radius } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (city) filter['address.city'] = { $regex: city, $options: 'i' };
  if (accessType) filter.accessType = accessType;

  let query = EvStation.find(filter);

  // Geo-spatial query
  if (latitude && longitude && radius) {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const radiusInMeters = parseInt(radius) * 1000; // Convert km to meters

    filter.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lon, lat]
        },
        $maxDistance: radiusInMeters
      }
    };
    query = EvStation.find(filter);
  }

  // Text search
  if (search) {
    query = query.find({ $text: { $search: search } });
  }

  const skip = (page - 1) * limit;

  const stations = await query
    .populate('operator', 'name email phone')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const stationsWithLive = await Promise.all(
    stations.map(async (station) => {
      const ports = await ChargerPort.find({ station: station._id, isActive: true });
      const available = ports.filter((p) => p.availability === 'available').length;
      const minPrice = ports.reduce((min, p) => {
        const price = p.pricing?.perKwh || p.pricing?.perMinute || 0;
        return price > 0 && price < min ? price : min;
      }, Infinity);
      const maxPower = ports.reduce((max, p) => Math.max(max, p.powerKw || 0), 0);
      const connectors = [...new Set(ports.map((p) => p.connectorType))];

      return {
        ...station.toObject(),
        liveSummary: {
          totalPorts: ports.length,
          available,
          occupied: ports.filter((p) => p.availability === 'occupied').length,
          status: available > 0 ? 'available' : ports.length > 0 ? 'busy' : 'offline',
          minPrice: minPrice === Infinity ? null : minPrice,
          maxPower,
          connectors
        }
      };
    })
  );

  const total = await EvStation.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(200, 'Stations fetched successfully', {
      stations: stationsWithLive,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    })
  );
});

// ─── Get Station by ID ────────────────────────────────────────
export const getStationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const station = await EvStation.findById(id)
    .populate('operator', 'name email phone');

  if (!station) {
    throw new ApiError(404, 'Station not found');
  }

  res.status(200).json(
    new ApiResponse(200, 'Station fetched successfully', station)
  );
});

// ─── Update Station ────────────────────────────────────────
export const updateStation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    address,
    photos,
    status,
    operatingHours,
    amenities,
    network,
    accessType,
    accessInstructions,
    is24Hours
  } = req.body;

  const station = await EvStation.findById(id);
  if (!station) {
    throw new ApiError(404, 'Station not found');
  }

  // Update allowed fields
  if (name) station.name = name;
  if (description) station.description = description;
  if (address) station.address = { ...station.address, ...address };
  if (photos) station.photos = photos;
  if (status) station.status = status;
  if (operatingHours) station.operatingHours = operatingHours;
  if (amenities) station.amenities = amenities;
  if (network) station.network = network;
  if (accessType) station.accessType = accessType;
  if (accessInstructions) station.accessInstructions = accessInstructions;
  if (is24Hours !== undefined) station.is24Hours = is24Hours;

  const updatedStation = await station.save();
  const populatedStation = await EvStation.findById(updatedStation._id).populate('operator', 'name email phone');

  res.status(200).json(
    new ApiResponse(200, 'Station updated successfully', populatedStation)
  );
});

// ─── Add Amenity ────────────────────────────────────────
export const addAmenity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, category, distance, notes } = req.body;

  if (!name || !category) {
    throw new ApiError(400, 'Name and category are required');
  }

  const station = await EvStation.findById(id);
  if (!station) {
    throw new ApiError(404, 'Station not found');
  }

  station.amenities.push({ name, category, distance, notes });
  const updatedStation = await station.save();

  res.status(200).json(
    new ApiResponse(200, 'Amenity added successfully', updatedStation)
  );
});

// ─── Update Operating Hours ────────────────────────────────────────
export const updateOperatingHours = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { operatingHours } = req.body;

  if (!operatingHours || !Array.isArray(operatingHours)) {
    throw new ApiError(400, 'Operating hours must be an array');
  }

  const station = await EvStation.findByIdAndUpdate(
    id,
    { operatingHours },
    { new: true }
  ).populate('operator', 'name email phone');

  if (!station) {
    throw new ApiError(404, 'Station not found');
  }

  res.status(200).json(
    new ApiResponse(200, 'Operating hours updated successfully', station)
  );
});

// ─── Get Stations by Operator ────────────────────────────────────────
export const getOperatorStations = asyncHandler(async (req, res) => {
  const { operatorId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  const stations = await EvStation.find({ operator: operatorId })
    .populate('operator', 'name email phone')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await EvStation.countDocuments({ operator: operatorId });

  res.status(200).json(
    new ApiResponse(200, 'Operator stations fetched successfully', {
      stations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    })
  );
});

// ─── Delete Station ────────────────────────────────────────
export const deleteStation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const station = await EvStation.findByIdAndDelete(id);
  if (!station) {
    throw new ApiError(404, 'Station not found');
  }

  res.status(200).json(
    new ApiResponse(200, 'Station deleted successfully', null)
  );
});

// ─── Get My Stations (logged-in operator) ────────────────────────────────────────
export const getMyStations = asyncHandler(async (req, res) => {
  const stations = await EvStation.find({ operator: req.user._id })
    .populate('operator', 'name email phone')
    .sort({ createdAt: -1 });

  const stationsWithPorts = await Promise.all(
    stations.map(async (station) => {
      const ports = await ChargerPort.find({ station: station._id, isActive: true });
      const available = ports.filter((p) => p.availability === 'available').length;
      const occupied = ports.filter((p) => p.availability === 'occupied').length;
      return {
        ...station.toObject(),
        liveStatus: {
          totalPorts: ports.length,
          available,
          occupied,
          offline: ports.filter((p) => p.availability === 'offline').length,
          reserved: ports.filter((p) => p.availability === 'reserved').length,
          ports
        }
      };
    })
  );

  res.status(200).json(
    new ApiResponse(200, 'Your stations fetched successfully', stationsWithPorts)
  );
});

// ─── Get Station Live Status ────────────────────────────────────────
export const getStationLiveStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const station = await EvStation.findById(id).populate('operator', 'name email phone');
  if (!station) throw new ApiError(404, 'Station not found');

  const ports = await ChargerPort.find({ station: id, isActive: true }).sort({ portNumber: 1 });

  const liveStatus = {
    totalPorts: ports.length,
    available: ports.filter((p) => p.availability === 'available').length,
    occupied: ports.filter((p) => p.availability === 'occupied').length,
    offline: ports.filter((p) => p.availability === 'offline').length,
    reserved: ports.filter((p) => p.availability === 'reserved').length,
    lastUpdated: ports.reduce((latest, p) => {
      const t = new Date(p.lastStatusUpdate).getTime();
      return t > latest ? t : latest;
    }, 0),
    ports
  };

  res.status(200).json(
    new ApiResponse(200, 'Live status fetched', { station, liveStatus })
  );
});

// ─── Get Nearby Stations ────────────────────────────────────────
export const getNearbyStations = asyncHandler(async (req, res) => {
  const { latitude, longitude, maxDistance = 50 } = req.query;

  if (!latitude || !longitude) {
    throw new ApiError(400, 'Latitude and longitude are required');
  }

  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  const distanceInMeters = parseInt(maxDistance) * 1000; // Convert km to meters

  const stations = await EvStation.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lon, lat]
        },
        $maxDistance: distanceInMeters
      }
    }
  })
    .populate('operator', 'name email phone')
    .limit(20);

  res.status(200).json(
    new ApiResponse(200, 'Nearby stations fetched successfully', stations)
  );
});
