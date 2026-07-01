// Standalone, idempotent script to create (or reset) an admin account.
// Safe to run any number of times — it upserts by email, so it won't fail
// even if the account already exists or if the main seed script never ran.
//
// Usage:
//   node src/scripts/createAdmin.js
//   node src/scripts/createAdmin.js someone@example.com "MyP@ssw0rd" 9811111111
//
// Defaults to admin@chargenp.com / Admin@123 / 9800000000 if no args given.

import { connectDb } from '#database/connection';
import { User } from '#models/User';
import { hashPassword } from '#utils/password';
import { normalizeNepalPhone, isValidNepalPhone } from '#utils/phone';

const [, , argEmail, argPassword, argPhone] = process.argv;

const email = (argEmail || 'admin@chargenp.com').toLowerCase();
const password = argPassword || 'Admin@123';
const rawPhone = argPhone || '9800000000';

const run = async () => {
  if (!isValidNepalPhone(rawPhone)) {
    console.error(`Invalid Nepal phone number: ${rawPhone}`);
    process.exit(1);
  }

  await connectDb();

  const phone = normalizeNepalPhone(rawPhone);
  const hashedPassword = await hashPassword(password);

  // Upsert by email. If the phone is already taken by a *different* account,
  // MongoDB will reject the write with a duplicate-key error — in that case
  // just re-run with a different phone number as the 3rd argument.
  const admin = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        name: 'Platform Admin',
        email,
        password: hashedPassword,
        phone,
        role: 'admin',
        isActive: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log('Admin account ready:');
  console.log('  email:   ', admin.email);
  console.log('  password:', password);
  console.log('  role:    ', admin.role);
  console.log('  isActive:', admin.isActive);
  process.exit(0);
};

run().catch((err) => {
  console.error('Failed to create/reset admin account:', err.message);
  process.exit(1);
});
