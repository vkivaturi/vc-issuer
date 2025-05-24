const { v4: uuidv4 } = require('uuid');
const { ApiError } = require('../middleware/errorHandler');
const { createAccessToken, signCredential } = require('../utils/joseUtils');

const createCredentialOffer = async (req, res) => {
  try {
    const { credential_type } = req.body;
    
    if (!credential_type) {
      throw new ApiError(400, 'credential_type is required');
    }
    
    const credentialOffer = {
      credential_issuer: `http://localhost:${process.env.PORT}`,
      credentials: [
        {
          format: 'jwt_vc',
          types: [credential_type]
        }
      ],
      grants: {
        urn: {
          'urn:ietf:params:oauth:grant-type:pre-authorized_code': {
            'pre-authorized_code': uuidv4(),
            'user_pin_required': false
          }
        }
      }
    };

    res.json(credentialOffer);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, `Error creating credential offer: ${error.message}`);
  }
};

const issueCredential = async (req, res) => {
  try {
    const { credential_type, claims } = req.body;
    
    if (!credential_type || !claims) {
      throw new ApiError(400, 'credential_type and claims are required');
    }
    
    // Validate the access token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new ApiError(401, 'No authorization token provided');
    }

    const credential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1'
      ],
      type: ['VerifiableCredential', credential_type],
      issuer: process.env.ISSUER_DID,
      issuanceDate: new Date().toISOString(),
      credentialSubject: claims
    };

    const signedCredential = await signCredential(
      credential,
      process.env.ISSUER_PRIVATE_KEY,
      process.env.ISSUER_KID
    );

    res.json({
      format: 'jwt_vc',
      credential: signedCredential
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, `Error issuing credential: ${error.message}`);
  }
};

const getToken = async (req, res) => {
  try {
    console.log('Token request body:', req.body);
    
    if (!process.env.ISSUER_PRIVATE_KEY) {
      throw new ApiError(500, 'ISSUER_PRIVATE_KEY environment variable is not set');
    }
    
    if (!process.env.ISSUER_KID) {
      throw new ApiError(500, 'ISSUER_KID environment variable is not set');
    }

    const { grant_type } = req.body;
    // Handle both parameter formats (hyphenated and camelCase)
    const preAuthorizedCode = req.body['pre-authorized_code'] || req.body.preAuthorizedCode;
    
    console.log('Extracted values:', { grant_type, preAuthorizedCode });
    
    if (!grant_type || !preAuthorizedCode) {
      throw new ApiError(400, `Missing required parameters. Received: grant_type=${grant_type}, pre-authorized_code=${preAuthorizedCode}`);
    }

    if (grant_type !== 'urn:ietf:params:oauth:grant-type:pre-authorized_code') {
      throw new ApiError(400, `Invalid grant type. Expected 'urn:ietf:params:oauth:grant-type:pre-authorized_code' but received '${grant_type}'`);
    }

    try {
      const accessToken = await createAccessToken(
        { 
          sub: uuidv4(),
          preAuthorizedCode 
        },
        process.env.ISSUER_PRIVATE_KEY,
        process.env.ISSUER_KID
      );

      res.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600
      });
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      throw new ApiError(500, `Error generating token: ${tokenError.message}`);
    }
  } catch (error) {
    console.error('Token endpoint error:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, `Unexpected error in token generation: ${error.message}`);
  }
};

module.exports = {
  createCredentialOffer,
  issueCredential,
  getToken
}; 