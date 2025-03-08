module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Check environment variables
  const envVars = {
    EMAIL_TO: !!process.env.EMAIL_TO,
    EMAIL_USER: !!process.env.EMAIL_USER,
    EMAIL_PASS: !!process.env.EMAIL_PASS
  };

  // Return debug info
  res.status(200).json({ 
    message: 'Debug endpoint is working',
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body ? 'Body present' : 'No body',
    query: req.query,
    envVars: envVars,
    timestamp: new Date().toISOString(),
    nodemailerInstalled: true
  });
};