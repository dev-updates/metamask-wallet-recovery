module.exports = (req, res) => {
  res.status(200).json({ 
    message: 'Debug endpoint is working',
    method: req.method,
    headers: req.headers,
    body: req.body ? 'Body present' : 'No body',
    query: req.query,
    timestamp: new Date().toISOString()
  });
};