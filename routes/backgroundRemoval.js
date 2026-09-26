const express = require('express');
const router = express.Router();
const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Remove background from uploaded image
router.post('/remove', async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const image = req.files.image;
    const tempPath = image.tempFilePath;

    // Read image file
    const imageBuffer = fs.readFileSync(tempPath);
    const base64Image = imageBuffer.toString('base64');

    // Use Replicate's background removal model
    const response = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: 'fb9a7a2f8d5c4f8f8f8f8f8f8f8f8f8f',
        input: {
          image: `data:image/png;base64,${base64Image}`
        }
      },
      {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
        }
      }
    );

    const outputUrl = response.data.output;

    // Download and process the result
    const outputResponse = await axios.get(outputUrl, { responseType: 'arraybuffer' });
    const outputBuffer = Buffer.from(outputResponse.data);

    // Save to output directory
    const outputFilename = `bg-removed-${Date.now()}.png`;
    const outputPath = path.join(process.env.OUTPUT_DIR || './outputs', outputFilename);
    fs.writeFileSync(outputPath, outputBuffer);

    // Clean up temp file
    fs.unlinkSync(tempPath);

    res.json({
      success: true,
      outputFile: outputFilename,
      outputPath: `/outputs/${outputFilename}`,
      message: 'Background removed successfully'
    });
  } catch (error) {
    console.error('Background removal error:', error.message);
    res.status(500).json({
      error: 'Failed to remove background',
      details: error.message
    });
  }
});

// Replace background with color or gradient
router.post('/replace-background', async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const { color = '#FFFFFF', mode = 'solid' } = req.body;
    const image = req.files.image;
    const tempPath = image.tempFilePath;

    let processedImage = sharp(tempPath);

    // Get metadata
    const metadata = await processedImage.metadata();

    // Create colored background
    if (mode === 'solid') {
      const backgroundBuffer = await sharp({
        create: {
          width: metadata.width,
          height: metadata.height,
          channels: 4,
          background: color
        }
      }).png().toBuffer();

      processedImage = sharp(backgroundBuffer).composite([
        { input: tempPath, blend: 'over' }
      ]);
    }

    const outputFilename = `bg-replaced-${Date.now()}.png`;
    const outputPath = path.join(process.env.OUTPUT_DIR || './outputs', outputFilename);

    await processedImage.toFile(outputPath);
    fs.unlinkSync(tempPath);

    res.json({
      success: true,
      outputFile: outputFilename,
      outputPath: `/outputs/${outputFilename}`,
      message: 'Background replaced successfully'
    });
  } catch (error) {
    console.error('Background replacement error:', error.message);
    res.status(500).json({
      error: 'Failed to replace background',
      details: error.message
    });
  }
});

module.exports = router;