const express = require('express');
const router = express.Router();
const { getIssuerMetadata } = require('../controllers/metadataController');

// OpenID Credential Issuer metadata endpoint
router.get('/.well-known/openid-credential-issuer', getIssuerMetadata);

module.exports = router; 