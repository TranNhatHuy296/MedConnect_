/**
 * Middleware sanitize XSS cho request body
 * Loai bo cac the HTML nguy hiem khoi input
 */
const escapeHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    return escapeHtml(value);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    return sanitizeObject(value);
  }
  return value;
};

const sanitizeObject = (obj) => {
  const sanitized = {};
  for (const key of Object.keys(obj)) {
    sanitized[key] = sanitizeValue(obj[key]);
  }
  return sanitized;
};

// Danh sach cac field KHONG sanitize (vi du: password)
const SKIP_FIELDS = ['password', 'oldPassword', 'newPassword'];

const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (!SKIP_FIELDS.includes(key)) {
        req.body[key] = sanitizeValue(req.body[key]);
      }
    }
  }
  next();
};

module.exports = { sanitizeBody, escapeHtml };
