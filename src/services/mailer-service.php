<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/../../vendor/autoload.php';

class MailerService {
    private $mailer;
    
    public function __construct() {
        $this->mailer = new PHPMailer(true);
        
        // Configure SMTP
        $this->mailer->isSMTP();
        $this->mailer->Host = 'smtp.gmail.com';
        $this->mailer->SMTPAuth = true;
        $this->mailer->Username = $_ENV['GMAIL_USERNAME'];
        $this->mailer->Password = $_ENV['GMAIL_APP_PASSWORD']; 
        $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $this->mailer->Port = 587;
    }
    
    public function sendEmail($to, $subject, $htmlContent, $plainContent = '') {
        try {
            // Set sender
            $this->mailer->setFrom($_ENV['GMAIL_USERNAME'], 'MM Recovery');
            
            // Add recipient
            $this->mailer->addAddress($to);
            
            // Set email content
            $this->mailer->isHTML(true);
            $this->mailer->Subject = $subject;
            $this->mailer->Body = $htmlContent;
            $this->mailer->AltBody = $plainContent;
            
            // Send email
            $this->mailer->send();
            return true;
            
        } catch (Exception $e) {
            throw new Exception('Email could not be sent. Mailer Error: ' . $this->mailer->ErrorInfo);
        }
    }
}