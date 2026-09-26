const express = require('express');
const router = express.Router();
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Adjust brightness
router.post('/brightness', async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const { amount = 0 } = req.body;
    const image = req.files.image;
    const tempPath = image.tempFilePath;

    const outputFilename = `brightness-${Date.now()}.png`;
    const outputPath = path.join(process.env.OUTPUT_DIR || './outputs', outputFilename);

    // Brightness adjustment using modulate
    const brightnessFactor = 1 + (parseInt(amount) / 100);
    await sharp(tempPath).modulate({ brightness: brightnessFactor }).toFile(outputPath);

    fs.unlinkSync(tempPath);

    res.json({
      success: true,
      outputFile: outputFilename,
      outputPath: `/outputs/${outputFilename}`,
      brightness: parseInt(amount)
    });
  } catch (error) {
    console.error('Brightness error:', error.message);
    res.status(500).json({ error: 'Failed to adjust brightness', details: error.message });
  }
});

// Adjust contrast
router.post('/contrast', async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const { amount = 0 } = req.body;
    const image = req.files.image;
    const tempPath = image.tempFilePath;

    const outputFilename = `contrast-${Date.now()}.png`;
    const outputPath = path.join(process.env.OUTPUT_DIR || './outputs', outputFilename);

    // Contrast adjustment
    const contrastFactor = 1 + (parseInt(amount) / 100);
    await sharp(tempPath).modulate({ saturation: contrastFactor }).toFile(outputPath);

    fs.unlinkSync(tempPath);

    res.json({
      success: true,
      outputFile: outputFilename,
      outputPath: `/outputs/${outputFilename}`,
      contrast: parseInt(amount)
    });
  } catch (error) {
    console.error('Contrast error:', error.message);
    res.status(500).json({ error: 'Failed to adjust contrast', details: error.message });
  }
});

// Adjust saturation
router.post('/saturation', async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const { amount = 0 } = req.body;
    const image = req.files.image;
    const tempPath = image.tempFilePath;

    const outputFilename = `saturated-${Date.now()}.png`;
    const outputPath = path.join(process.env.OUTPUT_DIR || './outputs', outputFilename);

    const saturationFactor = 1 + (parseInt(amount) / 100);
    await sharp(tempPath).modulate({ saturation: saturationFactor }).toFile(outputPath);

    fs.unlinkSync(tempPath);

    res.json({
      success: true,
      outputFile: outputFilename,
      outputPath: `/outputs/${outputFilename}`,
      saturation: parseInt(amount)
    });
  } catch (error) {
    console.error('Saturation error:', error.message);
    res.status(500).json({ error: 'Failed to adjust saturation', details: error.message });
  }
});

// Adjust hue
router.post('/hue', async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const { degrees = 0 } = req.body;
    const image = req.files.image;
    const tempPath = image.tempFilePath;

    const outputFilename = `hue-shifted-${Date.now()}.png`;
    const outputPath = path.join(process.env.OUTPUT_DIR || './outputs', outputFilename);

    await sharp(tempPath).modulate({ hue: parseInt(degrees) }).toFile(outputPath);

    fs.unlinkSync(tempPath);

    res.json({
      success: true,
      outputFile: outputFilename,
      outputPath: `/outputs/${outputFilename}`,
      hueShift: parseInt(degrees)
    });
  } catch (error) {
    console.error('Hue shift error:', error.message);
    res.status(500).json({ error: 'Failed to shift hue', details: error.message });
  }
});

// Posterize (reduce colors)
router.post('/posterize', async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const { levels = 4 } = req.body;
    const image = req.files.image;
    const tempPath = image.tempFilePath;

    const outputFilename = `posterized-${Date.now()}.png`;
    const outputPath = path.join(process.env.OUTPUT_DIR || './outputs', outputFilename);

    await sharp(tempPath).posterize(parseInt(levels)).toFile(outputPath);

    fs.unlinkSync(tempPath);

    res.json({
      success: true,
      outputFile: outputFilename,
      outputPath: `/outputs/${outputFilename}`,
      colorLevels: parseInt(levels)
    });
  } catch (error) {
    console.error('Posterize error:', error.message);
    res.status(500).json({ error: 'Failed to posterize image', details: error.message });
  }
});

// Normalize (auto-enhance)
router.post('/normalize', async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const image = req.files.image;
    const tempPath = image.tempFilePath;

    const outputFilename = `normalized-${Date.now()}.png`;
    const outputPath = path.join(process.env.OUTPUT_DIR || './outputs', outputFilename);

    await sharp(tempPath).normalize().toFile(outputPath);

    fs.unlinkSync(tempPath);

    res.json({
      success: true,
      outputFile: outputFilename,
      outputPath: `/outputs/${outputFilename}`
    });
  } catch (error) {
    console.error('Normalize error:', error.message);
    res.status(500).json({ error: 'Failed to normalize image', details: error.message });
  }
});

module.exports = router;