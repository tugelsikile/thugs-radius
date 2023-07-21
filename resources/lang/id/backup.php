<?php
return [
    'form_input' => [
        'id' => 'data_backup',
    ],
    'labels' => [
        'menu' => 'Backup dan Restore',
        'menu_info' => 'Backup atau Restore data',
        'backup' => 'Backup',
        'restore' => 'Restore',
        'name' => 'Nama',
        'date' => 'Tanggal',
        'size' => 'Ukuran',
    ],
    'import' => [
        'rst' => [
            'button' => 'Import Database RST',
        ]
    ],
    'restore' => [
        'button' => 'Restore',
        'success' => "Berhasil mengembalikan database.\nSilahkan refresh halaman untuk melihat perubahan",
        'confirm' => [
            'title' => 'Perhatian',
            'message' => "Database akan dikembalikan sesuai data backup ini.\nLanjutkan restore database ?",
            'yes' => 'Restore',
            'cancel' => 'Batal',
        ]
    ]
];
