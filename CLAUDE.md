# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a complete React SPA + Express API web application for SEO analysis with integrated deployment architecture:

### Deployment Architecture
- **Production**: Single unified server (`server.js`) serves both API routes at `/api/*` and React static files
- **Development**: Concurrent execution with backend (port 3000) and frontend dev server (port 3001)
- **Runtime Build Fallback**: Server automatically builds frontend if missing on startup
- **Render Platform**: Configured with `render.yaml` for cloud deployment

### Backend Architecture (Express API)
- **Core Engine**: SEO analysis engine (`seoAnalyzer.js`) with three specialized rule modules:
  - `meta-rules.js`: Title, description, Open Graph, canonical analysis
  - `content-rules.js`: Text content, headings, images, links, keyword density  
  - `tech-rules.js`: HTTPS, load time, status codes, mobile responsiveness, structured data
- **Scoring System**: Weighted scoring (Meta 40%, Content 35%, Technical 25%) with severity-based issue collection
- **API Layer**: REST endpoints with comprehensive validation, error handling, and health checks
- **Security**: CSP headers, CORS configuration, and security middleware

### Frontend Architecture (React SPA)
- **Single-Page Flow**: URL input → loading animation → comprehensive results display → new analysis capability
- **State Management**: React hooks managing analysis state, loading states, and error handling
- **UI Components**: 
  - `UrlInput`: URL validation form with Bootstrap styling
  - `ResultDisplay`: Tabbed interface showing scores, issues, and detailed SEO data
- **API Integration**: Axios service layer with environment-aware base URLs and comprehensive error handling
- **Responsive Design**: Bootstrap 5 with Japanese localization

## Common Development Commands

### Full Stack Development
```bash
# Install all dependencies (root, backend, frontend)
npm run install:all

# Development mode (concurrent backend + frontend servers)
npm run dev

# Production build and deployment
npm run build
npm start
```

### Backend Development
```bash
cd backend
npm run dev    # Development with nodemon auto-reload
npm start      # Production mode
npm test       # Run Jest tests (if configured)
```

### Frontend Development  
```bash
cd frontend
npm start      # Development server with hot reload
npm run build  # Production build to /build directory
npm test       # Run React testing library tests
```

### API Testing and Debugging
```bash
# Health check endpoint
curl http://localhost:3000/health

# SEO analysis with verbose output
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "options": {"verbose": true}}'

# API test endpoint  
curl http://localhost:3000/api/analyze/test
```

## SEO Analysis Engine

The core analysis follows this pipeline:
1. **URL Fetch**: `fetcher.js` retrieves HTML with timeout handling, redirect tracking, and load time metrics
2. **HTML Parsing**: Cheerio loads DOM for rule analysis
3. **Parallel Rule Analysis**: Three rule modules analyze different SEO aspects independently
4. **Weighted Score Calculation**: Combines category scores using predefined weights
5. **Issue Aggregation**: Collects and sorts issues by severity (critical → warning → info)

### Rule Module Structure
Each rule module follows the pattern:
```javascript
module.exports = {
  analyze: ($, url) => {
    return {
      score: 0-100,
      issues: [{ type, severity, message }],
      data: { /* analysis results */ }
    };
  }
};
```

### Frontend-Backend Contract
The API response structure is:
```javascript
{
  success: boolean,
  data: {
    url, finalUrl, statusCode, loadTime, redirects, timestamp,
    meta: { score, issues, data },
    content: { score, issues, data },  
    technical: { score, issues, data },
    score: number, // overall weighted score
    issues: [] // aggregated and sorted issues
  }
}
```

## Environment Configuration

### Development Environment
- Backend: `PORT=3000`, `NODE_ENV=development`
- Frontend: Uses proxy-free API calls to `http://localhost:3000`
- CORS enabled for `localhost:3001` origin

### Production Environment (Render)
- `NODE_ENV=production` enables relative API URLs
- `CI=false` prevents build warnings as errors
- `GENERATE_SOURCEMAP=false` reduces build size
- Health check configured at `/health`

### API URL Resolution
- **Development**: Explicit `http://localhost:3000` base URL
- **Production**: Empty base URL for same-origin requests (relative URLs)

## Deployment and Build Process

### Render Platform Configuration
- Build command: `npm run build` (installs all dependencies and builds frontend)
- Start command: `npm start` (runs unified production server)
- Runtime build fallback: Server attempts frontend build if missing on startup
- Health check: `/health` endpoint for service monitoring

### Build Dependencies
- All three `package.json` files (root, backend, frontend) must be properly configured
- Frontend build outputs to `frontend/build/` for static file serving
- Production server serves from `frontend/build` with fallback to React router

## Key Integration Points

- **API Contract**: Frontend expects specific response structure from `seoAnalyzer.js`
- **Error Handling**: Consistent error format across API with user-friendly frontend messages
- **Static File Serving**: Production server routes API calls to backend, everything else to React app
- **Security Headers**: CSP, XSS protection, and frame options configured in production server
- **Logging**: Comprehensive console logging for debugging API requests and SEO analysis steps