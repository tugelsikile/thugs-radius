<?php
return [
    'form_input' => [
        'id' => 'data_payment_gateway',
        'name' => 'nama_payment_gateway',
        'description' => 'keterangan_payment_gateway',
        'production_mode' => 'mode_produksi',
        'url' => 'url_merchant',
        'website' => 'url_website',
        'module' => 'nama_modul',
        'duitku' => [
            'merchant_code' => 'kode_merchant',
            'api_key' => 'kunci_api',
        ],
        'briapi' => [
            'consumer_key' => 'consumer_key',
            'consumer_secret' => 'consumer_secret'
        ]
    ],
    'labels' => [
        'menu' => 'Payment Gateway',
        'menu_info' => 'Manajemen payment gateway untuk pembayaran online',
        'name' => 'Nama Payment Gateways',
        'module' => 'Modul',
        'status' => 'Status',
        'description' => 'Keterangan',
        'mode' => [
            'label' => 'Mode',
            'production' => 'Mode Production',
            'sandbox' => 'Mode Sandbox',
        ],
        'url' => [
            'label' => 'URL Modul',
            'website' => 'Website',
            'production' => 'Production URL',
            'sandbox' => 'Sandbox URL',
        ]
    ],
    'promises' => [
        'pending' => 'Memuat data payment gateway',
        'success' => 'Berhasil memuat data payment gateway',
        'error' => 'Gagal memuat data payment gateway'
    ],
    'module' => [
        'name' => 'Nama Modul',
        'duitku' => [
            'label' => 'Duitku.com',
            'merchant_code' => 'Kode Merchant',
            'api_key' => 'Kunci API',
        ],
        'briapi' => [
            'label' => 'BRI API',
            'consumer_key' => 'Consumer Key',
            'consumer_secret' => 'Consumer Secret',
        ],
    ],
    'activate' => [
        'menu' => 'Aktivasi Payment Gateway',
        'menu_info' => 'Bisa mengaktifkan payment gateway untuk pembayaran online',
    ]
];
