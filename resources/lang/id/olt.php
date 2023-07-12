<?php
return [
    'form_input' => [
        'id' => 'data_olt',
        'name' => 'nama_olt',
        'host' => 'hostname',
        'port' => 'port',
        'read' => 'community_baca',
        'write' => 'community_tulis',
        'user' => 'username',
        'pass' => 'password',
        'onu' => 'data_onu',
        'phase_state' => 'phase_state',
    ],
    'labels' => [
        'menu' => 'OLT (experimental)',
        'menu_info' => 'Manajemen OLT (experimental)',
        'form_info' => 'Saat ini kami menggunakan <em class="text-primary">telnet</em> untuk komunikasi antara <em class="text-info">sistem</em> dengan <em class="text-danger">olt</em>, maka dari itu mohon gunakan variabel <em class="text-primary">telnet</em> untuk konfigurasi disamping ini.',
        'name' => 'Nama OLT',
        'host' => 'Hostname',
        'port' => 'Port',
        'detail' => 'Buka OLT',
        'uptime' => 'Uptime',
        'username' => 'Nama Pengguna',
        'password' => 'Kata Sandi',
        'onu' => [
            'index' => 'Index Onu',
            'description' => 'Deskripsi Onu',
        ],
        'community' => [
            'label' => 'Community',
            'read' => 'Community Baca',
            'write' => 'Community Tulis',
        ]
    ]
];
