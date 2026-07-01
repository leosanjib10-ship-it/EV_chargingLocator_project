import { connectDb } from '#database/connection';
import { User } from '#models/User';
import { EvStation } from '#models/Station';
import { ChargerPort } from '#models/Charger';
import { hashPassword } from '#utils/password';
import { normalizeNepalPhone } from '#utils/phone';

const seed = async () => {
  await connectDb();

  await User.deleteMany({ email: { $in: ['owner@chargenp.com', 'user@chargenp.com', 'admin@chargenp.com'] } });

  const ownerPassword = await hashPassword('Owner@123');
  const userPassword = await hashPassword('User@1234');
  const adminPassword = await hashPassword('Admin@123');

  const owner = await User.create({
    name: 'Demo Station Owner',
    email: 'owner@chargenp.com',
    password: ownerPassword,
    phone: normalizeNepalPhone('9811111111'),
    role: 'station_owner',
    businessName: 'ChargeNP Kathmandu',
    location: 'Kathmandu',
  });

  await User.create({
    name: 'Demo EV User',
    email: 'user@chargenp.com',
    password: userPassword,
    phone: normalizeNepalPhone('9822222222'),
    role: 'user',
    vehicleType: 'Electric Car',
  });

  await User.create({
    name: 'Demo Admin',
    email: 'admin@chargenp.com',
    password: adminPassword,
    phone: normalizeNepalPhone('9833333333'),
    role: 'admin',
  });

  const stations = [
    {
      name: 'NEA EV Station - Sundhara',
      description: 'Government EV charging hub in central Kathmandu',
      address: { street: 'Sundhara', city: 'Kathmandu', country: 'Nepal' },
      coordinates: [85.3145, 27.7008],
    },
    {
      name: 'Charging Hub - Boudha',
      description: 'Fast charging near Boudhanath',
      address: { street: 'Boudha Road', city: 'Kathmandu', country: 'Nepal' },
      coordinates: [85.3622, 27.7215],
    },
    {
      name: 'Pokhara EV Center',
      description: 'Lakeside charging station',
      address: { street: 'Lakeside', city: 'Pokhara', country: 'Nepal' },
      coordinates: [83.9856, 28.2096],
    },
  ];

  for (const s of stations) {
    const station = await EvStation.create({
      operator: owner._id,
      name: s.name,
      description: s.description,
      address: { ...s.address, formatted: `${s.address.street}, ${s.address.city}` },
      location: { type: 'Point', coordinates: s.coordinates },
      status: 'active',
      is24Hours: true,
      totalPorts: 0,
    });

    const portConfigs = [
      { portNumber: 'A1', connectorType: 'CCS', chargeLevel: 'DC_Fast', powerKw: 60, perKwh: 27 },
      { portNumber: 'A2', connectorType: 'Type2', chargeLevel: 'Level2', powerKw: 22, perKwh: 18 },
      { portNumber: 'B1', connectorType: 'GBT', chargeLevel: 'DC_Fast', powerKw: 50, perKwh: 20 },
    ];

    for (const p of portConfigs) {
      await ChargerPort.create({
        station: station._id,
        portNumber: p.portNumber,
        connectorType: p.connectorType,
        chargeLevel: p.chargeLevel,
        powerKw: p.powerKw,
        availability: Math.random() > 0.3 ? 'available' : 'occupied',
        pricing: { perKwh: p.perKwh, perMinute: Math.round((p.perKwh / 3) * 100) / 100, sessionFee: 50, currency: 'NPR' },
      });
      station.totalPorts += 1;
    }
    await station.save();
  }

  console.log('Seed complete!');
  console.log('Station Owner: owner@chargenp.com / Owner@123');
  console.log('EV User: user@chargenp.com / User@1234');
  console.log('Admin: admin@chargenp.com / Admin@123');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
