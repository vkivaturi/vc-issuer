const crypto = require('crypto');

/**
 * Creates a SHA-256 hash of a Buffer or string
 * @param {Buffer|string} data - The data to hash
 * @returns {string} The hex string of the hash
 */
function createSha256Hash(data) {
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
}

module.exports = {
  createSha256Hash
}; 