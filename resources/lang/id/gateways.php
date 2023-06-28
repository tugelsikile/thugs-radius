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
        'callback' => 'url_callback',
        'return' => 'url_return',
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
        'va' => 'Nomor Virtual Account',
        'copy_va' => 'Salin nomor virtual account',
        'va_copied' => 'Nomor virtual account berhasil disalin ke clipboard',
        'grand_total' => 'Grand Total',
        'reference_code' => 'Nomor Referensi',
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
            'callback' => [
                'label' => ' URL Callback',
                'copy' => 'Salin URL Callback',
                'copied' => 'Berhasil menyalin URL Callback kedalam clipboard',
                'info' => 'Salin  URL callback ini kedalam project duitku.com pada kolom bagian <strong class="text-primary">"Url Callback Proyek"</strong><br/>URL Callback ini sangat penting untuk validasi pada saat pelanggan melakukan pembayaran dengan channel pembayaran yang mereka inginkan',
            ],
            'return' => 'URL Kembali',
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
            'status' => [
                'process' => 'Menunggu Pembayaran',
                'success' => 'Lunas Pembayaran'
            ]
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
