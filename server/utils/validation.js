const { httpError } = require('./httpError');

const text = (value, field, { min = 1, max = 500 } = {}) => {
  if (typeof value !== 'string') {
    throw httpError(400, `${field} is required.`);
  }

  const normalized = value.trim();
  if (normalized.length < min || normalized.length > max) {
    throw httpError(
      400,
      `${field} must be between ${min} and ${max} characters.`,
    );
  }

  return normalized;
};

const email = (value) => {
  const normalized = text(value, 'Email', { min: 5, max: 254 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw httpError(400, 'Please provide a valid email address.');
  }
  return normalized;
};

const mobile = (value) => {
  const normalized = text(value, 'Mobile number', { min: 7, max: 20 });
  if (!/^\+?[0-9][0-9 ()-]{6,19}$/.test(normalized)) {
    throw httpError(400, 'Please provide a valid mobile number.');
  }
  return normalized;
};

const positiveNumber = (value, field, { allowZero = false } = {}) => {
  const normalized = Number(value);
  const minimum = allowZero ? 0 : Number.EPSILON;
  if (!Number.isFinite(normalized) || normalized < minimum) {
    throw httpError(400, `${field} must be a valid positive number.`);
  }
  return Math.round(normalized * 100) / 100;
};

const quantity = (value, { allowZero = false } = {}) => {
  const normalized = Number(value);
  const minimum = allowZero ? 0 : 1;
  if (!Number.isInteger(normalized) || normalized < minimum || normalized > 99) {
    throw httpError(400, `Quantity must be an integer from ${minimum} to 99.`);
  }
  return normalized;
};

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { email, escapeRegExp, mobile, positiveNumber, quantity, text };
