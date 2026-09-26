const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Upscale image using AI
router.post('/upscale', async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const { scale = 2, model = 'real-esrgan' } = req.body;
    const image = req.files.image;
    const tempPath = image.tempFilePath;

    // Read image and convert to base64
    const imageBuffer = fs.readFileSync(tempPath);
    const base64Image = imageBuffer.toString('base64');

    let upscaledImageUrl;

    if (model === 'real-esrgan') {
      // Use Replicate Real-ESRGAN
      const response = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: 'd0ee3d708c9b911713f475745201132c2ad14dd19cd15f60ee4f1d1512ee',
          input: {
            image: `data:image/png;base64,${base64Image}`,
            scale: parseInt(scale)
          }
        },
        {
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
          }
        }
      );

      upscaledImageUrl = response.data.output;
    }

    // Download upscaled image
    const outputResponse = await axios.get(upscaledImageUrl, { responseType: 'arraybuffer' });
    const outputBuffer = Buffer.from(outputResponse.data);

    // Save to output directory
    const outputFilename = `upscaled-${scale}x-${Date.now()}.png`;
    const outputPath = path.join(process.env.OUTPUT_DIR || './outputs', outputFilename);
    fs.writeFileSync(outputPath, outputBuffer);

    // Clean up
    fs.unlinkSync(tempPath);

    res.json({
      success: true,
      outputFile: outputFilename,
      outputPath: `/outputs/${outputFilename}`,
      scale: parseInt(scale),
      model
    });
  } catch (error) {
    console.error('Upscaling error:', error.message);
    res.status(500).json({
      error: 'Failed to upscale image',
      details: error.message
    });
  }
});

// Denoise image
router.post('/denoise', async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const image = req.files.image;
    const tempPath = image.tempFilePath;

    const imageBuffer = fs.readFileSync(tempPath);
    const base64Image = imageBuffer.toString('base64');

    // Use Replicate denoise model
    const response = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: 'ffe6b78b7aae9a0ecb59cc47c2bb3ac72ce1e6a898ccb0c90b9d47ef7ee6b',
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

    const denoisedImageUrl = response.data.output;
    const outputResponse = await axios.get(denoisedImageUrl, { responseType: 'arraybuffer' });
    const outputBuffer = Buffer.from(outputResponse.data);

    const outputFilename = `denoised-${Date.now()}.png`;
    const outputPath = path.join(process.env.OUTPUT_DIR || './outputs', outputFilename);
    fs.writeFileSync(outputPath, outputBuffer);
    fs.unlinkSync(tempPath);

    res.json({
      success: true,
      outputFile: outputFilename,
      outputPath: `/outputs/${outputFilename}`
    });
  } catch (error) {
    console.error('Denoise error:', error.message);
    res.status(500).json({
      error: 'Failed to denoise image',
      details: error.message
    });
  }
});

module.exports = router;