const express = require('express');
const router = express.Router();
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Process multiple images with same settings
router.post('/process-multiple', async (req, res) => {
  try {
    if (!req.files || !req.files.images) {
      return res.status(400).json({ error: 'Image files are required' });
    }

    const { operation = 'resize', width = 800, height = 600 } = req.body;
    const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

    const results = [];

    for (const image of images) {
      try {
        const tempPath = image.tempFilePath;
        const outputFilename = `batch-${operation}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`;
        const outputPath = path.join(process.env.OUTPUT_DIR || './outputs', outputFilename);

        let pipeline = sharp(tempPath);

        if (operation === 'resize') {
          pipeline = pipeline.resize(parseInt(width), parseInt(height), { fit: 'contain' });
        } else if (operation === 'grayscale') {
          pipeline = pipeline.grayscale();
        } else if (operation === 'blur') {
          pipeline = pipeline.blur(5);
        } else if (operation === 'sharpen') {
          pipeline = pipeline.sharpen();
        }

        await pipeline.toFile(outputPath);
        fs.unlinkSync(tempPath);

        results.push({
          original: image.name,
          outputFile: outputFilename,
          outputPath: `/outputs/${outputFilename}`,
          success: true
        });
      } catch (error) {
        results.push({
          original: image.name,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      totalImages: images.length,
      results,
      operation
    });
  } catch (error) {
    console.error('Batch processing error:', error.message);
    res.status(500).json({
      error: 'Failed to process batch',
      details: error.message
    });
  }
});

// Create image collage
router.post('/create-collage', async (req, res) => {
  try {
    if (!req.files || !req.files.images) {
      return res.status(400).json({ error: 'Image files are required' });
    }

    const { columns = 2, imageWidth = 400, imageHeight = 400 } = req.body;
    const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

    const composites = [];
    let x = 0;
    let y = 0;
    let col = 0;

    for (const image of images) {
      const tempPath = image.tempFilePath;
      composites.push({
        input: tempPath,
        left: x * parseInt(imageWidth),
        top: y * parseInt(imageHeight)
      });

      col++;
      if (col >= parseInt(columns)) {
        col = 0;
        y++;
      } else {
        x++;
      }
    }

    const rows = Math.ceil(images.length / parseInt(columns));
    const totalWidth = parseInt(columns) * parseInt(imageWidth);
    const totalHeight = rows * parseInt(imageHeight);

    // Create base image
    const outputFilename = `collage-${Date.now()}.png`;
    const outputPath = path.join(process.env.OUTPUT_DIR || './outputs', outputFilename);

    let base = await sharp({
      create: {
        width: totalWidth,
        height: totalHeight,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    }).png();

    // Add images to base
    const processedComposites = [];
    for (const composite of composites) {
      const resized = await sharp(composite.input)
        .resize(parseInt(imageWidth), parseInt(imageHeight), { fit: 'cover' })
        .toBuffer();
      
      processedComposites.push({
        input: resized,
        left: composite.left,
        top: composite.top
      });
    }

    await base.composite(processedComposites).toFile(outputPath);

    res.json({
      success: true,
      outputFile: outputFilename,
      outputPath: `/outputs/${outputFilename}`,
      collageInfo: {
        columns: parseInt(columns),
        rows,
        totalWidth,
        totalHeight
      }
    });
  } catch (error) {
    console.error('Collage creation error:', error.message);
    res.status(500).json({
      error: 'Failed to create collage',
      details: error.message
    });
  }
});

module.exports = router;