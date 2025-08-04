const express = require('express');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Import backend API routes
const analyzeRoutes = require('./backend/src/api/analyze');
const { errorHandler, notFound } = require('./backend/src/middleware/errorHandler');

// Security and middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "font-src 'self' https://cdn.jsdelivr.net; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self'"
  );
  
  // Other security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
});

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

// Debug: Log build path and directory contents
console.log('🔍 Build path:', buildPath);
console.log('📁 Build directory exists:', fs.existsSync(buildPath));
console.log('📁 Current working directory:', process.cwd());
console.log('📁 __dirname:', __dirname);

// Check frontend directory structure
const frontendPath = path.join(__dirname, 'frontend');
console.log('📂 Frontend directory exists:', fs.existsSync(frontendPath));
if (fs.existsSync(frontendPath)) {
  console.log('📂 Frontend directory contents:', fs.readdirSync(frontendPath));
}

if (fs.existsSync(buildPath)) {
  console.log('📂 Build directory contents:', fs.readdirSync(buildPath));
} else {
  console.log('❌ Build directory not found, attempting to build...');
  
  // Attempt to build frontend if not found
  try {
    console.log('🔨 Running frontend build...');
    const frontendPath = path.join(__dirname, 'frontend');
    if (fs.existsSync(frontendPath)) {
      process.chdir(frontendPath);
      
      // First install dependencies
      console.log('📦 Installing frontend dependencies...');
      execSync('npm install', { stdio: 'inherit' });
      
      // Then build
      console.log('🏗️ Building frontend...');
      execSync('npm run build', { stdio: 'inherit' });
      
      process.chdir(__dirname);
      
      if (fs.existsSync(buildPath)) {
        console.log('✅ Build completed successfully!');
        console.log('📂 Build directory contents:', fs.readdirSync(buildPath));
      } else {
        console.log('❌ Build completed but directory not found');
      }
    }
  } catch (error) {
    console.log('❌ Build failed:', error.message);
    console.log('🔍 Attempting alternative build strategy...');
    
    // Alternative: run from root with full path
    try {
      process.chdir(__dirname);
      console.log('📦 Installing all dependencies from root...');
      execSync('npm run install:all', { stdio: 'inherit' });
      console.log('🏗️ Building from root...');
      execSync('cd frontend && npm run build', { stdio: 'inherit' });
      
      if (fs.existsSync(buildPath)) {
        console.log('✅ Alternative build completed successfully!');
        console.log('📂 Build directory contents:', fs.readdirSync(buildPath));
      }
    } catch (altError) {
      console.log('❌ Alternative build also failed:', altError.message);
    }
  }
  
  // Check alternative paths as fallback
  const alternativePaths = [
    path.join(__dirname, 'build'),
    path.join(process.cwd(), 'frontend/build'),
    path.join(process.cwd(), 'build')
  ];
  
  for (const altPath of alternativePaths) {
    console.log(`🔍 Checking alternative path: ${altPath}`);
    if (fs.existsSync(altPath)) {
      console.log(`✅ Found build at: ${altPath}`);
      console.log(`📂 Contents: ${fs.readdirSync(altPath)}`);
    }
  }
}

// Only serve static files if build directory exists
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
}

// Serve React app for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  
  // Check if build directory exists
  if (!fs.existsSync(buildPath)) {
    return res.status(500).json({
      success: false,
      message: 'Frontend build not found. The build process may have failed.',
      error: { 
        status: 500,
        buildPath: buildPath,
        currentWorkingDirectory: process.cwd(),
        directoryContents: fs.readdirSync(process.cwd())
      }
    });
  }
  
  // Check if index.html exists
  if (!fs.existsSync(indexPath)) {
    return res.status(500).json({
      success: false,
      message: 'Frontend index.html not found in build directory.',
      error: { 
        status: 500,
        indexPath: indexPath,
        buildContents: fs.readdirSync(buildPath)
      }
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