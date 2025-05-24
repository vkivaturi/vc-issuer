const express = require('express');
const router = express.Router();
const {
  createEvent,
  listEvents,
  updateEvent
} = require('../controllers/eventController');

// Create a new event
router.post('/event/add', createEvent);

// List all events
router.get('/event/list', listEvents);

// Update an event
router.put('/event/update/:id', updateEvent);

module.exports = router; 