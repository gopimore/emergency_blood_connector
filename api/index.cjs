// Serverless adapter for Vercel: forwards requests to the Express `app` exported by backend/app.js
let appInstance;
let dbConnected = false;
let connectingPromise;

module.exports = async function handler(req, res) {
  try {
    if (!appInstance) {
      console.log('Vercel serverless adapter initializing');
      console.log('MONGO_URI present:', Boolean(process.env.MONGO_URI));
      console.log('NODE_ENV:', process.env.NODE_ENV);
    }

    const { default: app } = await import('../backend/app.js');
    appInstance = app;

    // Connect to database only once (with promise to avoid race conditions)
    if (!dbConnected && !connectingPromise) {
      connectingPromise = (async () => {
        try {
          const dns = require('dns');
          dns.setServers(['8.8.8.8', '1.1.1.1', '9.9.9.9']);
          
          const connectDB = (await import('../backend/src/config/db.js')).default;
          await Promise.race([
            connectDB(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('DB connection timeout')), 8000))
          ]);
          dbConnected = true;
          console.log('✓ Database connected on Vercel');
        } catch (dbErr) {
          console.error('✗ Database connection error:', dbErr.message);
          dbConnected = false;
          throw dbErr;
        }
      })();

      try {
        await connectingPromise;
      } catch (err) {
        connectingPromise = null;
        throw err;
      }
    } else if (connectingPromise) {
      await connectingPromise;
    }

    // Express apps are callable as functions (req, res)
    return app(req, res);
  } catch (err) {
    console.error('Serverless adapter error:', err);
    res.statusCode = 500;
    res.json({ success: false, message: 'Server error: ' + err.message });
  }
};
