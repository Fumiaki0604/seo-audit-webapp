# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a React SPA + Express API web application for SEO analysis with integrated deployment architecture:

### Deployment Architecture
- **Production**: Single server deployment where Express serves both API routes and React static files
- **Development**: Separate servers (backend:3000, frontend:3001) with concurrent execution
- **Root server.js**: Production server that serves API routes at `/api/*` and React app for all other routes

### Backend Architecture (Express API)
- **Core Engine**: SEO analysis engine with three specialized rule modules:
  - `meta-rules.js`: Title, description, Open Graph, canonical analysis
  - `content-rules.js`: Text content, headings, images, links, keyword density
  - `tech-rules.js`: HTTPS, load time, status codes, mobile responsiveness, structured data
- **Scoring System**: Weighted scoring (Meta 40%, Content 35%, Technical 25%) with issue collection and severity ranking
- **API Layer**: RESTful endpoints with validation, error handling, and health checks

### Frontend Architecture (React SPA)
- **Single-Page Flow**: URL input → loading state → results display → new analysis
- **State Management**: React hooks for analysis state, loading, and error handling
- **UI Components**: `UrlInput` (form with validation) and `ResultDisplay` (visual results with scores/issues)
- **API Integration**: Axios-based service layer with interceptors for logging and error handling

## Common Development Commands

### Full Stack Development
```bash
# Install all dependencies (root, backend, frontend)
npm run install:all

# Development mode (concurrent backend + frontend servers)
npm run dev

# Production build and start
npm run build
npm start
```

### Backend Only
```bash
cd backend
npm run dev    # Development with nodemon
npm start      # Production mode
```

### Frontend Only  
```bash
cd frontend
npm start      # Development server (port 3001)
npm run build  # Production build
```

### API Testing
```bash
# Health check
curl http://localhost:3000/health

# SEO analysis
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## SEO Analysis Engine

The core SEO analysis follows this flow:
1. **URL Fetch**: `fetcher.js` retrieves HTML with error handling and metrics
2. **HTML Parsing**: Cheerio parses DOM for analysis rules
3. **Rule Analysis**: Three rule modules analyze different SEO aspects independently
4. **Score Calculation**: Weighted algorithm combines category scores into overall score
5. **Issue Collection**: All issues aggregated and sorted by severity (critical → warning → info)

### Adding New SEO Rules
- Extend rule modules in `backend/src/services/rules/`
- Follow pattern: analyze() → return { score, issues, data }
- Update `seoAnalyzer.js` calculateScore() and collectIssues() methods

### Extending Frontend Components
- Results display uses severity-based styling classes (issue-critical, issue-warning, issue-info)
- Score visualization uses score ranges for color coding (80+: green, 60+: yellow, <60: red)
- All components expect data structure from backend SEO analysis response

## Environment Variables

### Development
- Backend runs on PORT 3000
- Frontend proxy configured to backend in package.json

### Production (Render deployment)
- `NODE_ENV=production`
- `PORT` set by platform
- `REACT_APP_API_URL` for API base URL (if different from same-origin)

## Key Integration Points

- **API-Frontend Contract**: Response format defined by seoAnalyzer.js structure
- **Error Handling**: Consistent error format across API with frontend error display
- **Static Serving**: Production server.js serves React build from `/frontend/build`
- **CORS**: Backend configured for development frontend origin (localhost:3001)