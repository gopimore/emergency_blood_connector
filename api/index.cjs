// Serverless adapter for Vercel: forwards requests to the Express `app` exported by backend/app.js
let appInstance;
let dbConnected = false;

module.exports = async function handler(req, res) {
  try {
    const { default: app } = await import('../backend/app.js');
    appInstance = app;

    // Connect to database only once
    if (!dbConnected) {
      try {
        const dns = require('dns');
        dns.setServers(['8.8.8.8', '1.1.1.1', '9.9.9.9']);
        
        const connectDB = (await import('../backend/src/config/db.js')).default;
        await connectDB();
        dbConnected = true;
        console.log('Database connected on Vercel');
      } catch (dbErr) {
        console.error('Database connection error:', dbErr);
        // Continue anyway - might be a transient error
      }
    }

    // Express apps are callable as functions (req, res)
    return app(req, res);
  } catch (err) {
    // Basic error handling to surface import failures in Vercel logs
    console.error('Serverless adapter error:', err);
    res.statusCode = 500;
    res.end('Server error');
  }
};
