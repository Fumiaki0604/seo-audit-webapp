const express = require('express');
const router = express.Router();
const seoAnalyzer = require('../services/seoAnalyzer');
const { validateUrl } = require('../middleware/validation');

// POST /api/analyze
router.post('/', validateUrl, async (req, res, next) => {
  try {
    const { url, options = {} } = req.body;
    
    console.log(`🔍 Starting SEO analysis for: ${url}`);
    console.log(`📋 Options:`, options);

    const startTime = Date.now();
    const results = await seoAnalyzer.analyze(url, options);
    const analysisTime = Date.now() - startTime;

    console.log(`✅ Analysis completed in ${analysisTime}ms`);

    res.json({
      success: true,
      data: {
        ...results,
        _meta: {
          analysisTime,
          timestamp: new Date().toISOString(),
          apiVersion: '1.0.0'
        }
      }
    });

  } catch (error) {
    console.error('Analysis error:', error.message);
    next(error);
  }
});

// GET /api/analyze/test
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'SEO Analysis API is working!',
    endpoints: {
      analyze: 'POST /api/analyze',
      test: 'GET /api/analyze/test'
    },
    sampleRequest: {
      url: 'https://example.com',
      options: {
        verbose: true,
        includeImages: true,
        timeout: 10000
      }
    }
  });
});

module.exports = router;