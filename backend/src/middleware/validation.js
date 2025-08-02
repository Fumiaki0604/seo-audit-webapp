const validateUrl = (req, res, next) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      message: 'URL is required',
      error: {
        status: 400,
        field: 'url'
      }
    });
  }

  // Basic URL validation
  try {
    const urlObj = new URL(url);
    
    // Check protocol
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return res.status(400).json({
        success: false,
        message: 'URL must use HTTP or HTTPS protocol',
        error: {
          status: 400,
          field: 'url',
          provided: urlObj.protocol
        }
      });
    }

    // Check hostname
    if (!urlObj.hostname) {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL hostname',
        error: {
          status: 400,
          field: 'url'
        }
      });
    }

    // Normalize URL
    req.body.url = urlObj.href;
    
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid URL format',
      error: {
        status: 400,
        field: 'url',
        details: error.message
      }
    });
  }

  next();
};

module.exports = {
  validateUrl
};