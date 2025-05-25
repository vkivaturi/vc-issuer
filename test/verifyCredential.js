const { jwtVerify, importSPKI } = require('jose');
const crypto = require('crypto');
const axios = require('axios');

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

/**
 * Fetches and imports the issuer's public key
 * @returns {Promise<KeyLike>} The imported public key
 */
async function getIssuerPublicKey() {
  try {
    const response = await axios.get('http://localhost:3000/.well-known/jwks.json');
    const jwks = response.data;
    
    // Convert base64 to DER Buffer
    const publicKeyDer = Buffer.from(jwks.keys[0].x5c[0], 'base64');
    
    // Create public key from DER
    const publicKey = crypto.createPublicKey({
      key: publicKeyDer,
      format: 'der',
      type: 'spki'
    });

    // Export as PEM for jose
    const publicKeyPem = publicKey.export({
      format: 'pem',
      type: 'spki'
    });

    return importSPKI(publicKeyPem, 'ES256');
  } catch (error) {
    console.error('Error fetching/processing public key:', error);
    throw error;
  }
}

/**
 * Verifies a credential response from the issuer
 * @param {Object} response - The credential response from the issuer
 * @returns {Promise<Object>} The verified credential payload
 */
async function verifyCredential(response) {
  try {
    // 1. Get issuer's public key
    const publicKey = await getIssuerPublicKey();

    // 2. Verify JWT signature and decode
    const { payload } = await jwtVerify(response.credential, publicKey);
    console.log('JWT verification successful');
    console.log('Verified payload:', payload);

    // 3. For VendorPermit, verify image integrity
    if (payload.type === 'VendorPermit' && response.attachments?.permitImage) {
      // Get hash from verified credential
      const expectedHash = payload.evidence.permitImageHash.replace('sha256:', '');
      
      // Hash the received image
      const imageBuffer = Buffer.from(response.attachments.permitImage, 'base64');
      const actualHash = createSha256Hash(imageBuffer);

      // Compare hashes
      if (expectedHash !== actualHash) {
        throw new Error('Image verification failed - hash mismatch');
      }
      console.log('Image verification successful');
    }

    return payload;
  } catch (error) {
    console.error('Verification failed:', error);
    throw error;
  }
}

// Example usage
async function testVerification() {
  try {
    // 1. Get credential offer
    const offerResponse = await axios.post('http://localhost:3000/credential-offer', {
      credential_type: 'VendorPermit',
      user_id: 'user123'
    });
    console.log('Received credential offer:', offerResponse.data);

    // 2. Get access token
    const tokenResponse = await axios.post('http://localhost:3000/token', {
      grant_type: 'urn:ietf:params:oauth:grant-type:pre-authorized_code',
      'pre-authorized_code': offerResponse.data.grants['urn:ietf:params:oauth:grant-type:pre-authorized_code']['pre-authorized_code']
    });
    console.log('Received access token:', tokenResponse.data);

    // 3. Get and verify credential
    const credentialResponse = await axios.post('http://localhost:3000/credentials', {}, {
      headers: {
        'Authorization': `Bearer ${tokenResponse.data.access_token}`
      }
    });
    console.log('Received credential response:', credentialResponse.data);

    // 4. Verify the credential
    const verifiedCredential = await verifyCredential(credentialResponse.data);
    console.log('Verification successful!');
    console.log('Verified credential:', verifiedCredential);
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Server response:', error.response.data);
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testVerification();
}

module.exports = {
  verifyCredential,
  testVerification
}; 