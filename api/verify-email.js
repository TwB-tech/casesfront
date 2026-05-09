// Vercel serverless function: verify email token via Appwrite
export default async function handler(req, res) {
  // Quick test: always return success to confirm endpoint is live
  return res.status(200).json({ test: 'ok', method: req.method, env: process.env.NODE_ENV || 'unknown' });
}
