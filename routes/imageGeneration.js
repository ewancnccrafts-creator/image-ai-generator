const express = require('express');
const router = express.Router();
const axios = require('axios');

// Generate image using OpenAI DALL-E or local models
router.post('/generate', async (req, res) => {
  try {
    const { prompt, model = 'dall-e-3', size = '1024x1024' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    let imageUrl;

    if (model === 'dall-e-3' || model === 'dall-e-2') {
      // OpenAI DALL-E
      const response = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          prompt,
          model: model === 'dall-e-3' ? 'dall-e-3' : 'dall-e-2',
          n: 1,
          size: model === 'dall-e-3' ? '1024x1024' : size,
          quality: model === 'dall-e-3' ? 'hd' : 'standard',
          response_format: 'url'
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        }
      );
      imageUrl = response.data.data[0].url;
    } else if (model === 'stable-diffusion') {
      // Replicate Stable Diffusion
      const response = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: 'ac732df83cea7fff18b0b1c4e5f38c7dd5ad7fa1',
          input: {
            prompt,
            num_outputs: 1,
            height: parseInt(size.split('x')[1]),
            width: parseInt(size.split('x')[0])
          }
        },
        {
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
          }
        }
      );
      imageUrl = response.data.output[0];
    }

    res.json({
      success: true,
      imageUrl,
      prompt,
      model,
      size
    });
  } catch (error) {
    console.error('Image generation error:', error.message);
    res.status(500).json({
      error: 'Failed to generate image',
      details: error.message
    });
  }
});

// Generate image variants
router.post('/generate-variants', async (req, res) => {
  try {
    const { imageUrl, count = 3 } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const response = await axios.post(
      'https://api.openai.com/v1/images/variations',
      {
        image: imageUrl,
        n: count,
        size: '1024x1024',
        response_format: 'url'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    res.json({
      success: true,
      variants: response.data.data.map(item => item.url)
    });
  } catch (error) {
    console.error('Variant generation error:', error.message);
    res.status(500).json({
      error: 'Failed to generate variants',
      details: error.message
    });
  }
});

module.exports = router;