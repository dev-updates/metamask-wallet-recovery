// Create a basic API handler
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Return a simple JSON response
  res.status(200).json({ 
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
};