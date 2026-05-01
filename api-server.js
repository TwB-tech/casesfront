import express from 'express';
import cors from 'cors';
import reyaHandler from './api/reya.js';
import appwriteProxyHandler from './api/appwrite-proxy.js';
import contactHandler from './api/contact.js';
import sendVerificationEmailHandler from './api/send-verification-email.js';
import verifyEmailHandler from './api/verify-email.js';

// Load environment variables from .env
import { config } from 'dotenv';
config();

const app = express();

// CORS: allow all origins in development
app.use(cors({ origin: true, credentials: true }));

// Parse JSON bodies
app.use(express.json());

// API Routes
app.post('/api/reya', (req, res) => reyaHandler(req, res));
app.use('/api/appwrite-proxy', appwriteProxyHandler);
app.post('/api/contact', (req, res) => contactHandler(req, res));
app.post('/api/send-verification-email', (req, res) => sendVerificationEmailHandler(req, res));
app.post('/api/verify-email', (req, res) => verifyEmailHandler(req, res));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-server', timestamp: new Date().toISOString() });
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`);
  console.log(`   • POST /api/reya`);
  console.log(`   • /api/appwrite-proxy/*`);
  console.log(`   • GET /api/health`);
});
