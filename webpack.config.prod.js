const path = require('path');
const webpack = require('webpack');
const WebpackObfuscator = require('webpack-obfuscator');
const crypto = require('crypto');

// Generate build hash for integrity checking
const buildHash = crypto.randomBytes(16).toString('hex');

module.exports = {
  // ... existing webpack config ...

  plugins: [
    // ... existing plugins ...

    // Code obfuscation for production builds
    new WebpackObfuscator(
      {
        rotateStringArray: true,
        stringArray: true,
        stringArrayThreshold: 0.75,
        stringArrayEncoding: ['base64'],
        stringArrayWrappersCount: 2,
        stringArrayWrappersChainedCalls: true,
        stringArrayWrappersParametersMaxCount: 4,
        stringArrayWrappersType: 'function',
        stringArrayThreshold: 0.75,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        numbersToExpressions: true,
        simplify: true,
        shuffleStringArray: true,
        splitStrings: true,
        splitStringsChunkLength: 10,
        debugProtection: true,
        debugProtectionInterval: 4000,
        disableConsoleOutput: false, // Keep console for debugging but watermark it
        domainLock: [], // Will be set dynamically
        selfDefending: true,
        sourceMap: false, // Disable source maps in production
        sourceMapBaseUrl: '',
        sourceMapFileName: '',
        sourceMapMode: 'separate',
        unicodeEscapeSequence: false,
      },
      ['excluded_bundle.js']
    ),

    // Inject build metadata for integrity checking
    new webpack.DefinePlugin({
      'process.env.BUILD_HASH': JSON.stringify(buildHash),
      'process.env.BUILD_TIME': JSON.stringify(new Date().toISOString()),
      'process.env.VERSION': JSON.stringify(process.env.npm_package_version || '2.0.0'),
    }),
  ],

  // Optimization settings
  optimization: {
    minimize: true,
    minimizer: [
      // ... existing minimizers ...
    ],
  },

  // Security headers (when served)
  devServer: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
    },
  },
};
