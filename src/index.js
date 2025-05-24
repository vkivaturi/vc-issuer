require('dotenv').config();
const express = require('express');
const cors = require('cors');
const credentialRoutes = require('./routes/credentialRoutes');
const metadataRoutes = require('./routes/metadataRoutes');
const eventRoutes = require('./routes/eventRoutes');
const errorHandler = require('./middleware/errorHandler').errorHandler;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', metadataRoutes);
app.use('/', credentialRoutes);
app.use('/', eventRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 