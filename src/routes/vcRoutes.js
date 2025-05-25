const express = require('express');
const router = express.Router();
const {
  createCredential,
  getCredentialImage
} = require('../controllers/vcController');

// Create a new credential
router.post('/vc/create', createCredential);

// Get credential image
router.get('/vc/image/:id', getCredentialImage);

module.exports = router; 