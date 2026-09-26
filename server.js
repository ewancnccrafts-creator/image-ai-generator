require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const fs = require('fs');

// Import route handlers
const imageGeneration = require('./routes/imageGeneration');
const backgroundRemoval = require('./routes/backgroundRemoval');
const imageProcessing = require('./routes/imageProcessing');
const upscaling = require('./routes/upscaling');
const colorAdjustment = require('./routes/colorAdjustment');
const batchProcessing = require('./routes/batchProcessing');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 52 * 1024 * 1024 } // 52MB
}));

// Ensure upload and output directories exist
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const outputDir = process.env.OUTPUT_DIR || './outputs';

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Static files
app.use(express.static('public'));

// API Routes
app.use('/api/generate', imageGeneration);
app.use('/api/background-removal', backgroundRemoval);
app.use('/api/process', imageProcessing);
app.use('/api/upscale', upscaling);
app.use('/api/color-adjust', colorAdjustment);
app.use('/api/batch', batchProcessing);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Image AI Generator running on http://localhost:${PORT}`);
  console.log(`📁 Upload directory: ${uploadDir}`);
  console.log(`📁 Output directory: ${outputDir}`);
});
