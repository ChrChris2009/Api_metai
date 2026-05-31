const express = require("express");
const secure = require('ssl-express-www');
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const helmet = require('helmet');
const compression = require('compression');
const log = require("./includes/log");
const config = require("./config.json");

// Initialize global config
global.config = config;
global.api = new Map();

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable if you need to load external resources
  crossOriginEmbedderPolicy: false // Disable if you need to load external resources
}));

// Performance middleware
app.use(compression());

// Essential middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'includes', 'public'), {
  maxAge: '1d',
  etag: true
}));
app.use(express.static(path.join(__dirname, 'includes', 'web'), {
  maxAge: '1d',
  etag: true
}));

// Router setup
const router = require("./includes/router");
app.use(router);

// Expose the config to the frontend
app.get("/config", (req, res) => {
  res.json(config);
});

// Server configuration
app.enable('trust proxy');
app.set("json spaces", 2);

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// SSL redirect
app.use(secure);

// Body parser setup with limits
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ 
  extended: true,
  limit: '10mb'
}));

// API endpoints
app.get("/api-list", (req, res) => {
  try {
    const apiList = Array.from(global.api.values()).map(api => ({
      name: api.config.name,
      description: api.config.description,
      // Use api.config.link if available, otherwise fall back to api.config.path
      endpoint: `/api${api.config.link || api.meta.path}`,
      category: api.config.category
    }));
    res.json(apiList);
  } catch (error) {
    log.error('Error generating API list:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to generate API list'
    });
  }
});

// Main route
app.get("/", (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "includes", "public", "index.html"));
  } catch (error) {
    log.error('Error serving index page:', error);
    res.status(500).send('Internal server error');
  }
});

// 404 handler
app.use((req, res) => {
  try {
    res.status(404).sendFile(path.join(__dirname, "includes", "public", "404.html"));
  } catch (error) {
    log.error('Error serving 404 page:', error);
    res.status(404).send('Page not found');
  }
});

// Error handler
app.use((err, req, res, next) => {
  log.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

// Server initialization
const PORT = process.env.PORT || global.config.port || 3000;

const server = app.listen(PORT, () => {
  log.main(`Server is running on port ${PORT}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  log.main('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    log.main('HTTP server closed');
    process.exit(0);
  });
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error);
  server.close(() => {
    process.exit(1);
  });
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;
