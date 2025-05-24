require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');
const credentialRoutes = require('./routes/credentialRoutes');
const metadataRoutes = require('./routes/metadataRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', metadataRoutes);
app.use('/', credentialRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`VC Issuer server running on port ${PORT}`);
}); 