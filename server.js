const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Import backend API routes
const analyzeRoutes = require('./backend/src/api/analyze');
const { errorHandler, notFound } = require('./backend/src/middleware/errorHandler');

// Security and middleware (simplified for production)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes - must come before static files
app.use('/api/analyze', analyzeRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Serve static files from React build
const buildPath = path.join(__dirname, 'frontend/build');
app.use(express.static(buildPath));

// Serve React app for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  
  // Check if build directory exists
  if (!require('fs').existsSync(buildPath)) {
    return res.status(500).json({
      success: false,
      message: 'Frontend build not found. Please run npm run build first.',
      error: { status: 500 }
    });
  }
  
  res.sendFile(indexPath);
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 SEO Audit Web App running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 API endpoint: http://localhost:${PORT}/api/analyze`);
  console.log(`🌐 Web App: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
});