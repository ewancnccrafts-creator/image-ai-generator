const express = require('express');
const router = express.Router();
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Resize image
router.post('/resize', async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const { width, height, fit = 'contain' } = req.body;
    const image = req.files.image;
    const tempPath = image.tempFilePath;

    if (!width || !height) {
      return res.status(400).json({ error: 'Width and height are required' });
    }

    const outputFilename = `resized-${Date.now()}.png`;
    const outputPath = path.join(process.env.OUTPUT_DIR || './outputs', outputFilename);

    await sharp(tempPath)
      .resize(parseInt(width), parseInt(height), { fit, withoutEnlargement: true })
      .toFile(outputPath);

    fs.unlinkSync(tempPath);

    res.json({
      success: true,
      outputFile: outputFilename,
      outputPath: `/outputs/${outputFilename}`,
      width: parseInt(width),
      height: parseInt(height)
    });
  } catch (error) {
    console.error('Resize error:', error.message);
    res.status(500).json({ error: 'Failed to resize image', details: error.message });
  }
});

// Convert image format
router.post('/convert', async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const { format = 'png', quality = 80 } = req.body;
    const image = req.files.image;
    const tempPath = image.tempFilePath;

    const outputFilename = `converted-${Date.now()}.${format}`;
    const outputPath = path.join(process.env.OUTPUT_DIR || './outputs', outputFilename);

    let pipeline = sharp(tempPath);

    if (format === 'jpeg') {
      pipeline = pipeline.jpeg({ quality: parseInt(quality), progressive: true });
    } else if (format === 'png') {
      pipeline = pipeline.png({ quality: parseInt(quality) });
    } else if (format === 'webp') {
      pipeline = pipeline.webp({ quality: parseInt(quality) });
    } else if (format === 'tiff') {
      pipeline = pipeline.tiff();
    }

    await pipeline.toFile(outputPath);
    fs.unlinkSync(tempPath);

    res.json({
      success: true,
      outputFile: outputFilename,
      outputPath: `/outputs/${outputFilename}`,
      format
    });
  } catch (error) {
    console.error('Convert error:', error.message);
    res.status(500).json({ error: 'Failed to convert image', details: error.message });
  }
});

// Grayscale conversion
router.post('/grayscale', async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const image = req.files.image;
    const tempPath = image.tempFilePath;

    const outputFilename = `grayscale-${Date.now()}.png`;
    const outputPath = path.join(process.env.OUTPUT_DIR || './outputs', outputFilename);

    await sharp(tempPath).grayscale().toFile(outputPath);
    fs.unlinkSync(tempPath);

    res.json({
      success: true,
      outputFile: outputFilename,
      outputPath: `/outputs/${outputFilename}`
    });
  } catch (error) {
    console.error('Grayscale error:', error.message);
    res.status(500).json({ error: 'Failed to convert to grayscale', details: error.message });
  }
});

// Apply blur
router.post('/blur', async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const { amount = 5 } = req.body;
    const image = req.files.image;
    const tempPath = image.tempFilePath;

    const outputFilename = `blurred-${Date.now()}.png`;
    const outputPath = path.join(process.env.OUTPUT_DIR || './outputs', outputFilename);

    await sharp(tempPath).blur(parseInt(amount)).toFile(outputPath);
    fs.unlinkSync(tempPath);

    res.json({
      success: true,
      outputFile: outputFilename,
      outputPath: `/outputs/${outputFilename}`,
      blurAmount: parseInt(amount)
    });
  } catch (error) {
    console.error('Blur error:', error.message);
    res.status(500).json({ error: 'Failed to apply blur', details: error.message });
  }
});

// Apply sharpening
router.post('/sharpen', async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const image = req.files.image;
    const tempPath = image.tempFilePath;

    const outputFilename = `sharpened-${Date.now()}.png`;
    const outputPath = path.join(process.env.OUTPUT_DIR || './outputs', outputFilename);

    await sharp(tempPath).sharpen().toFile(outputPath);
    fs.unlinkSync(tempPath);

    res.json({
      success: true,
      outputFile: outputFilename,
      outputPath: `/outputs/${outputFilename}`
    });
  } catch (error) {
    console.error('Sharpen error:', error.message);
    res.status(500).json({ error: 'Failed to sharpen image', details: error.message });
  }
});

// Flip/Rotate
router.post('/transform', async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const { rotate = 0, flip = false, flop = false } = req.body;
    const image = req.files.image;
    const tempPath = image.tempFilePath;

    let pipeline = sharp(tempPath);

    if (rotate) pipeline = pipeline.rotate(parseInt(rotate));
    if (flip === 'true' || flip === true) pipeline = pipeline.flip();
    if (flop === 'true' || flop === true) pipeline = pipeline.flop();

    const outputFilename = `transformed-${Date.now()}.png`;
    const outputPath = path.join(process.env.OUTPUT_DIR || './outputs', outputFilename);

    await pipeline.toFile(outputPath);
    fs.unlinkSync(tempPath);

    res.json({
      success: true,
      outputFile: outputFilename,
      outputPath: `/outputs/${outputFilename}`,
      rotation: parseInt(rotate)
    });
  } catch (error) {
    console.error('Transform error:', error.message);
    res.status(500).json({ error: 'Failed to transform image', details: error.message });
  }
});

module.exports = router;