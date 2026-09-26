require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const fs = require('fs');

const imageGeneration = require('./routes/imageGeneration');
const backgroundRemoval = require('./routes/backgroundRemoval');
const imageProcessing = require('./routes/imageProcessing');
const upscaling = require('./routes/upscaling');
const colorAdjustment = require('./routes/colorAdjustment');
const batchProcessing = require('./routes/batchProcessing');

const app = express();
const PORT = process.env.PORT || 3000;
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
const outputDir = path.resolve(process.env.OUTPUT_DIR || './outputs');

for (const directory of [uploadDir, outputDir]) {
  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/image-ai-generator',
  limits: { fileSize: Number(process.env.MAX_IMAGE_SIZE || 52428800) },
  abortOnLimit: true
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/outputs', express.static(outputDir, { index: false }));

app.use('/api/generate', imageGeneration);
app.use('/api/background-removal', backgroundRemoval);
app.use('/api/process', imageProcessing);
app.use('/api/upscale', upscaling);
app.use('/api/color-adjust', colorAdjustment);
app.use('/api/batch', batchProcessing);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/download/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(outputDir, filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Output file not found' });
  res.download(filePath, filename);
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

app.listen(PORT, () => {
  console.log(`Image AI Generator running on http://localhost:${PORT}`);
});
