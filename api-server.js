import express from 'express';
import cors from 'cors';
import reyaHandler from './api/reya.js';
import appwriteProxyHandler from './api/appwrite-proxy.js';
import contactHandler from './api/contact.js';
import sendVerificationEmailHandler from './api/send-verification-email.js';
import verifyEmailHandler from './api/verify-email.js';
import sendClientInviteHandler from './api/send-client-invite.js';
import sendEmployeeInviteHandler from './api/send-employee-invite.js';

// Load environment variables from .env
import { config } from 'dotenv';
config();

const app = express();

// CORS: allow all origins in development
app.use(cors({ origin: true, credentials: true }));

// Keep proxy before JSON parsing so it can read raw request streams.
app.use('/api/appwrite-proxy', appwriteProxyHandler);

// Parse JSON bodies for API routes that read req.body.
app.use(express.json());

// API Routes
app.post('/api/reya', (req, res) => reyaHandler(req, res));
app.post('/api/contact', (req, res) => contactHandler(req, res));
app.post('/api/send-verification-email', (req, res) => sendVerificationEmailHandler(req, res));
app.post('/api/verify-email', (req, res) => verifyEmailHandler(req, res));
app.post('/api/send-client-invite', sendClientInviteHandler);
app.post('/api/send-employee-invite', sendEmployeeInviteHandler);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-server', timestamp: new Date().toISOString() });
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`);
  console.log(`   • POST /api/reya`);
  console.log(`   • /api/appwrite-proxy/*`);
  console.log(`   • POST /api/contact`);
  console.log(`   • POST /api/send-verification-email`);
  console.log(`   • POST /api/verify-email`);
  console.log(`   • POST /api/send-client-invite`);
  console.log(`   • POST /api/send-employee-invite`);
  console.log(`   • GET /api/health`);
});
