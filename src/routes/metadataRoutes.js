const express = require('express');
const router = express.Router();
const { getIssuerMetadata } = require('../controllers/metadataController');
const crypto = require('crypto');

// OpenID Credential Issuer metadata endpoint
router.get('/.well-known/openid-credential-issuer', getIssuerMetadata);

// JWKS endpoint
router.get('/.well-known/jwks.json', async (req, res) => {
  try {
    // Import the private key
    const privateKeyPem = process.env.ISSUER_PRIVATE_KEY;
    
    // Convert PEM to public key using Node's crypto
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    const publicKey = crypto.createPublicKey(privateKey);
    
    // Get the raw public key data
    const publicKeyDer = publicKey.export({
      type: 'spki',
      format: 'der'
    });

    // Create the JWKS response
    const jwks = {
      keys: [
        {
          kty: 'EC',
          kid: process.env.ISSUER_KID,
          use: 'sig',
          alg: 'ES256',
          x5c: [publicKeyDer.toString('base64')],
          crv: 'P-256'
        }
      ]
    };

    res.json(jwks);
  } catch (error) {
    console.error('JWKS generation error:', error);
    res.status(500).json({ error: 'Failed to generate JWKS' });
  }
});

module.exports = router; 