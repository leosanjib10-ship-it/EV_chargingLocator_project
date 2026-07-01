// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation — must match backend policy:
// min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
export const isValidPassword = (password) => {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least 1 uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least 1 lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least 1 number' };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least 1 special character' };
  }
  return { valid: true, message: 'Password is valid' };
};

// Nepal mobile number validation — matches backend regex
// Accepts: 9812345678, 9861234567, +9779812345678
const NEPAL_PHONE_REGEX = /^(\+977)?(9[678]\d{8})$/;

export const isValidPhone = (phone) => {
  if (!phone) return false;
  return NEPAL_PHONE_REGEX.test(phone.trim());
};

// Login validation
export const validateLogin = (email, password) => {
  const errors = [];

  if (!email || !email.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Email format is invalid');
  }

  if (!password || !password.trim()) {
    errors.push('Password is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// User signup validation
export const validateUserSignup = (data) => {
  const errors = [];

  if (!data.fullName || !data.fullName.trim()) {
    errors.push('Full Name is required');
  }

  if (!data.email || !data.email.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(data.email)) {
    errors.push('Email format is invalid');
  }

  if (!data.phone || !data.phone.trim()) {
    errors.push('Phone number is required');
  } else if (!isValidPhone(data.phone)) {
    errors.push('Phone number format is invalid');
  }

  if (!data.vehicleType) {
    errors.push('Vehicle type is required');
  }

  if (!data.password || !data.password.trim()) {
    errors.push('Password is required');
  } else {
    const passwordCheck = isValidPassword(data.password);
    if (!passwordCheck.valid) {
      errors.push(passwordCheck.message);
    }
  }

  if (!data.confirmPassword || !data.confirmPassword.trim()) {
    errors.push('Confirm Password is required');
  } else if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match');
  }

  if (!data.agree) {
    errors.push('You must accept Terms & Conditions');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Station owner signup validation
export const validateStationSignup = (data) => {
  const errors = [];

  if (!data.fullName || !data.fullName.trim()) {
    errors.push('Full Name is required');
  }

  if (!data.businessName || !data.businessName.trim()) {
    errors.push('Business Name is required');
  }

  if (!data.email || !data.email.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(data.email)) {
    errors.push('Email format is invalid');
  }

  if (!data.phone || !data.phone.trim()) {
    errors.push('Phone number is required');
  } else if (!isValidPhone(data.phone)) {
    errors.push('Phone number format is invalid');
  }

  if (!data.stationLocation || !data.stationLocation.trim()) {
    errors.push('Station location is required');
  }

  if (!data.password || !data.password.trim()) {
    errors.push('Password is required');
  } else {
    const passwordCheck = isValidPassword(data.password);
    if (!passwordCheck.valid) {
      errors.push(passwordCheck.message);
    }
  }

  if (!data.confirmPassword || !data.confirmPassword.trim()) {
    errors.push('Confirm Password is required');
  } else if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match');
  }

  if (!data.agree) {
    errors.push('You must accept Terms & Conditions');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
