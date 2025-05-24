const express = require('express');
const router = express.Router();
const {
  createCredentialOffer,
  issueCredential,
  getToken
} = require('../controllers/credentialController');

// Credential offer endpoint
router.post('/credential-offer', createCredentialOffer);

// Credential issuance endpoint
router.post('/credentials', issueCredential);

// Token endpoint
router.post('/token', getToken);

module.exports = router; 