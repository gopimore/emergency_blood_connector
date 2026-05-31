// Serverless adapter for Vercel: forwards requests to the Express `app` exported by backend/app.js
module.exports = async function handler(req, res) {
  try {
    const { default: app } = await import('../backend/app.js');
    // Express apps are callable as functions (req, res)
    return app(req, res);
  } catch (err) {
    // Basic error handling to surface import failures in Vercel logs
    console.error('Serverless adapter error:', err);
    res.statusCode = 500;
    res.end('Server error');
  }
};
