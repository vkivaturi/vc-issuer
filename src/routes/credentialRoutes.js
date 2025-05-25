const express = require('express');
const router = express.Router();
const {
  createCredentialOffer,
  issueCredential,
  getToken
} = require('../controllers/credentialController');
const { asyncHandler } = require('../middleware/errorHandler');

// Credential offer endpoint
router.post('/credential-offer', asyncHandler(createCredentialOffer));

// Credential issuance endpoint
router.post('/credentials', asyncHandler(issueCredential));

// Token endpoint
router.post('/token', asyncHandler(getToken));

module.exports = router; 