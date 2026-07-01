import mongoose from 'mongoose';
import { ChargerPort } from '../models/Charger.js';
import { EvStation } from '../models/Station.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// ─── Create Charger Port ────────────────────────────────────────
export const createChargerPort = asyncHandler(async (req, res) => {
  const {
    stationId,
    portNumber,
    connectorType,
    chargeLevel,
    powerKw,
    voltage,
    amperage,
    pricing,
    notes
  } = req.body;

  // Validate required fields
  if (!stationId || !connectorType || !chargeLevel) {
    throw new ApiError(400, 'Missing required fields');
  }

  // Check if station exists
  const station = await EvStation.findById(stationId);
  if (!station) {
    throw new ApiError(404, 'Station not found');
  }

  const chargerPort = await ChargerPort.create({
    station: stationId,
    portNumber,
    connectorType,
    chargeLevel,
    powerKw,
    voltage,
    amperage,
    pricing: pricing || {
      currency: 'USD'
    },
    notes
  });

  // Update station's total ports count
  await EvStation.findByIdAndUpdate(
    stationId,
    { $inc: { totalPorts: 1 } }
  );

  const populatedPort = await ChargerPort.findById(chargerPort._id)
    .populate('station', 'name address');

  res.status(201).json(
    new ApiResponse(201, 'Charger port created successfully', populatedPort)
  );
});

// ─── Get All Charger Ports ────────────────────────────────────────
export const getAllChargerPorts = asyncHandler(async (req, res) => {
  const {
    stationId,
    connectorType,
    chargeLevel,
    availability,
    page = 1,
    limit = 10
  } = req.query;

  const filter = { isActive: true };
  if (stationId) filter.station = stationId;
  if (connectorType) filter.connectorType = connectorType;
  if (chargeLevel) filter.chargeLevel = chargeLevel;
  if (availability) filter.availability = availability;

  const skip = (page - 1) * limit;

  const ports = await ChargerPort.find(filter)
    .populate('station', 'name address photos')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await ChargerPort.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(200, 'Charger ports fetched successfully', {
      ports,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    })
  );
});

// ─── Get Charger Port by ID ────────────────────────────────────────
export const getChargerPortById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const port = await ChargerPort.findById(id)
    .populate('station', 'name address photos operatingHours amenities');

  if (!port) {
    throw new ApiError(404, 'Charger port not found');
  }

  res.status(200).json(
    new ApiResponse(200, 'Charger port fetched successfully', port)
  );
});

// ─── Update Charger Port ────────────────────────────────────────
export const updateChargerPort = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    portNumber,
    connectorType,
    chargeLevel,
    powerKw,
    voltage,
    amperage,
    availability,
    pricing,
    isActive,
    notes
  } = req.body;

  const port = await ChargerPort.findById(id);
  if (!port) {
    throw new ApiError(404, 'Charger port not found');
  }

  // Update allowed fields
  if (portNumber) port.portNumber = portNumber;
  if (connectorType) port.connectorType = connectorType;
  if (chargeLevel) port.chargeLevel = chargeLevel;
  if (powerKw !== undefined) port.powerKw = powerKw;
  if (voltage !== undefined) port.voltage = voltage;
  if (amperage !== undefined) port.amperage = amperage;
  if (availability) {
    port.availability = availability;
    port.lastStatusUpdate = new Date();
  }
  if (pricing) port.pricing = { ...port.pricing, ...pricing };
  if (isActive !== undefined) port.isActive = isActive;
  if (notes) port.notes = notes;

  const updatedPort = await port.save();
  const populatedPort = await ChargerPort.findById(updatedPort._id)
    .populate('station', 'name address');

  res.status(200).json(
    new ApiResponse(200, 'Charger port updated successfully', populatedPort)
  );
});

// ─── Update Port Status ────────────────────────────────────────
export const updatePortStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { availability } = req.body;

  if (!availability || !['available', 'occupied', 'offline', 'reserved'].includes(availability)) {
    throw new ApiError(400, 'Invalid availability status');
  }

  const port = await ChargerPort.findByIdAndUpdate(
    id,
    {
      availability,
      lastStatusUpdate: new Date()
    },
    { new: true }
  ).populate('station', 'name address');

  if (!port) {
    throw new ApiError(404, 'Charger port not found');
  }

  res.status(200).json(
    new ApiResponse(200, 'Port status updated successfully', port)
  );
});

// ─── Get Ports by Station ────────────────────────────────────────
export const getPortsByStation = asyncHandler(async (req, res) => {
  const { stationId } = req.params;
  const { availability, page = 1, limit = 10 } = req.query;

  const filter = { station: stationId, isActive: true };
  if (availability) filter.availability = availability;

  const skip = (page - 1) * limit;

  const ports = await ChargerPort.find(filter)
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ portNumber: 1 });

  const total = await ChargerPort.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(200, 'Station ports fetched successfully', {
      ports,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    })
  );
});

// ─── Get Available Ports by Connector Type ────────────────────────────────────────
export const getAvailablePortsByConnector = asyncHandler(async (req, res) => {
  const { connectorType, chargeLevel } = req.query;

  if (!connectorType) {
    throw new ApiError(400, 'Connector type is required');
  }

  const filter = {
    connectorType,
    availability: 'available',
    isActive: true
  };

  if (chargeLevel) filter.chargeLevel = chargeLevel;

  const ports = await ChargerPort.find(filter)
    .populate('station', 'name address location avgRating')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, 'Available ports fetched successfully', ports)
  );
});

// ─── Update Pricing ────────────────────────────────────────
export const updatePricing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { perKwh, perMinute, sessionFee, currency, freeCharging } = req.body;

  const port = await ChargerPort.findById(id);
  if (!port) {
    throw new ApiError(404, 'Charger port not found');
  }

  port.pricing = {
    perKwh: perKwh !== undefined ? perKwh : port.pricing.perKwh,
    perMinute: perMinute !== undefined ? perMinute : port.pricing.perMinute,
    sessionFee: sessionFee !== undefined ? sessionFee : port.pricing.sessionFee,
    currency: currency || port.pricing.currency,
    freeCharging: freeCharging !== undefined ? freeCharging : port.pricing.freeCharging
  };

  const updatedPort = await port.save();
  const populatedPort = await ChargerPort.findById(updatedPort._id)
    .populate('station', 'name address');

  res.status(200).json(
    new ApiResponse(200, 'Pricing updated successfully', populatedPort)
  );
});

// ─── Delete Charger Port ────────────────────────────────────────
export const deleteChargerPort = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const port = await ChargerPort.findByIdAndDelete(id);
  if (!port) {
    throw new ApiError(404, 'Charger port not found');
  }

  // Update station's total ports count
  await EvStation.findByIdAndUpdate(
    port.station,
    { $inc: { totalPorts: -1 } }
  );

  res.status(200).json(
    new ApiResponse(200, 'Charger port deleted successfully', null)
  );
});

// ─── Get Port Statistics by Station ────────────────────────────────────────
export const getPortStatisticsByStation = asyncHandler(async (req, res) => {
  const { stationId } = req.params;

  const stats = await ChargerPort.aggregate([
    { $match: { station: new mongoose.Types.ObjectId(stationId) } },
    {
      $group: {
        _id: '$availability',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalPorts = await ChargerPort.countDocuments({ station: stationId });

  const response = {
    total: totalPorts,
    byAvailability: {}
  };

  stats.forEach(stat => {
    response.byAvailability[stat._id] = stat.count;
  });

  res.status(200).json(
    new ApiResponse(200, 'Port statistics fetched successfully', response)
  );
});
