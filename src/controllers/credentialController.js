const { createAccessToken } = require('../utils/joseUtils');
const { checkCredentialAvailability, getCredentialDetails } = require('../utils/dbUtils');
const ApiError = require('../middleware/errorHandler').ApiError;

// Add environment variable check at the top
if (!process.env.ISSUER_PRIVATE_KEY) {
  console.error('ISSUER_PRIVATE_KEY environment variable is not set');
  process.exit(1);
}

if (!process.env.ISSUER_KID) {
  console.error('ISSUER_KID environment variable is not set');
  process.exit(1);
}

const createCredentialOffer = async (req, res) => {
  const { credential_type, user_id } = req.body;
  
  if (!credential_type) {
    throw new ApiError(400, 'credential_type is required');
  }

  if (!user_id) {
    throw new ApiError(400, 'user_id is required');
  }

  const hasValidCredential = await checkCredentialAvailability(user_id, credential_type);
  if (!hasValidCredential) {
    throw new ApiError(404, 'No valid credential found for this user');
  }

  // Generate a random pre-authorized code
  const preAuthorizedCode = require('crypto').randomUUID();

  // Store the pre-authorized code with user_id for later verification
  // In a real implementation, this should be stored in a database
  global.preAuthCodeMapping = global.preAuthCodeMapping || new Map();
  global.preAuthCodeMapping.set(preAuthorizedCode, user_id);

  const credentialOffer = {
    credential_issuer: 'http://localhost:3000',
    credential_configuration_ids: [credential_type],
    grants: {
      'urn:ietf:params:oauth:grant-type:pre-authorized_code': {
        'pre-authorized_code': preAuthorizedCode,
        user_pin_required: false
      }
    }
  };

  res.json(credentialOffer);
};

const getToken = async (req, res) => {
  console.log('Token request body:', req.body);
  
  const grantType = req.body.grant_type;
  const preAuthorizedCode = req.body.preAuthorizedCode || req.body['pre-authorized_code'];

  if (!grantType || !preAuthorizedCode) {
    throw new ApiError(400, `Missing required parameters. Received: grant_type=${grantType}, pre-authorized_code=${preAuthorizedCode}`);
  }

  if (grantType !== 'urn:ietf:params:oauth:grant-type:pre-authorized_code') {
    throw new ApiError(400, 'Invalid grant_type');
  }

  // Verify the pre-authorized code and get the associated user_id
  if (!global.preAuthCodeMapping || !global.preAuthCodeMapping.has(preAuthorizedCode)) {
    throw new ApiError(400, 'Invalid pre-authorized code');
  }

  const userId = global.preAuthCodeMapping.get(preAuthorizedCode);
  
  const accessToken = await createAccessToken(
    { sub: userId },
    process.env.ISSUER_PRIVATE_KEY,
    process.env.ISSUER_KID
  );
  
  // Store the access token for later verification
  global.accessTokenMapping = global.accessTokenMapping || new Map();
  global.accessTokenMapping.set(accessToken, userId);

  // Remove the used pre-authorized code
  global.preAuthCodeMapping.delete(preAuthorizedCode);

  res.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600
  });
};

const issueCredential = async (req, res) => {
  const accessToken = req.headers.authorization?.split(' ')[1];
  
  if (!accessToken) {
    throw new ApiError(401, 'Access token is required');
  }

  // Verify the access token and get the associated user_id
  if (!global.accessTokenMapping || !global.accessTokenMapping.has(accessToken)) {
    throw new ApiError(401, 'Invalid access token');
  }

  const userId = global.accessTokenMapping.get(accessToken);
  const credential = await getCredentialDetails(userId);
  
  if (!credential) {
    throw new ApiError(404, 'No credential found for this user');
  }

  // Remove the used access token
  global.accessTokenMapping.delete(accessToken);

  // Add issuance date and validity period if not present
  const now = new Date();
  const enrichedCredential = {
    ...credential,
    issuanceDate: credential.issuanceDate || now.toISOString(),
    validFrom: now.toISOString(),
    validUntil: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Valid for 1 year
    issuer: 'http://localhost:3000'
  };

  // For VendorPermit, convert permit_image to base64 if it's a Buffer
  if (enrichedCredential.type === 'VendorPermit' && enrichedCredential.permitImage) {
    if (Buffer.isBuffer(enrichedCredential.permitImage)) {
      enrichedCredential.permitImage = enrichedCredential.permitImage.toString('base64');
    }
  }

  res.json({
    credential: enrichedCredential,
    format: 'jwt_vc'
  });
};

module.exports = {
  createCredentialOffer,
  getToken,
  issueCredential
}; 