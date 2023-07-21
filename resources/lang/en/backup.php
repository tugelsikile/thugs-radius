<?php
return [
    'form_input' => [
        'id' => 'backup_data',
    ],
    'labels' => [
        'menu' => 'Backup and Restore',
        'menu_info' => 'Backup or Restore data',
        'backup' => 'Backup',
        'restore' => 'Restore',
        'name' => 'Name',
        'date' => 'Date',
        'size' => 'Size',
    ],
    'import' => [
        'rst' => [
            'button' => 'Import from RST Database',
        ]
    ],
    'restore' => [
        'button' => 'Restore',
        'success' => "Success restore",
        'confirm' => [
            'title' => 'Warning',
            'message' => "Restore database ?",
            'yes' => 'Restore',
            'cancel' => 'Cancel',
        ]
    ]
];
