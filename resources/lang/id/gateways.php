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
        ],
        'midtrans' => [
            'merchant_id' => 'id_merchant',
            'server_key' => 'kunci_server',
            'client_key' => 'kunci_client',
            'urls' => [
                'notification' => 'notification_url',
                'recurring' => 'recurring_url',
                'account' => 'account_url',
                'finish' => 'finish_url',
                'unfinished' => 'unfinished_url',
                'error' => 'error_url',
            ]
        ],
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
        'paid_before' => 'Bayar Sebelum Tgl.',
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
            'label' => 'Duitku',
            'merchant_code' => 'Kode Merchant',
            'api_key' => 'Kunci API',
            'status' => [
                'process' => 'Menunggu Pembayaran',
                'success' => 'Lunas Pembayaran',
                'expired' => 'Kode Pembayaran Kadaluarsa'
            ],
            'info_callback_url' => 'Salin  URL callback ini kedalam project duitku.com pada kolom bagian <strong class="text-primary">"Url Callback Proyek"</strong><br/>URL Callback ini sangat penting untuk validasi pada saat pelanggan melakukan pembayaran dengan channel pembayaran yang mereka inginkan',
        ],
        'briapi' => [
            'label' => 'BRI API',
            'consumer_key' => 'Consumer Key',
            'consumer_secret' => 'Consumer Secret',
        ],
        'midtrans' => [
            'label' => 'Midtrans',
            'merchant_id' => 'ID Merchant',
            'server_key' => 'Kunci Server',
            'client_key' => 'Kunci Client',
            'status' => [
                'pending' => 'Menunggu Pembayaran',
                'capture' => 'Pembayaran Tersimpan',
                'settlement' => 'Lunas Pembayaran',
                'deny' => 'Pembayaran Ditolak',
                'cancel' => 'Pembayaran Dibatalkan',
                'expire' => 'Kode Pembayaran Kadaluarsa',
                'failure' => 'Pembayaran Gagal',
                'refund' => 'Pembayaran Dikembalikan',
                'chargeback' => 'Pembayaran Diminta Kembali',
                'partial_refund' => 'Pembayaran Diambil Sebagian',
                'partial_chargeback' => 'Pembayaran Dikembalikan Sebagian',
                'authorize' => 'Pembayaran Diotorisasi',
            ],
            'urls' => [
                'copy' => 'Salin :Attribute',
                'copied' => 'Berhasil menyaling :Attribute',
                'notification' => [
                    'label' => 'Url Notifikasi',
                    'info' => 'Url jika ada pembayaran dari pelanggan',
                ],
                'recurring' => [
                    'label' => 'Url Recurring',
                    'info' => 'Url jika ada recurring pembayaran dari pelanggan',
                ],
                'account' => [
                    'label' => 'Url Pay Account',
                    'info' => 'Url jika ada status pay account pembayaran dari pelanggan',
                ],
                'finish' => [
                    'label' => 'Url Redirect Selesai',
                    'info' => 'Url redirect jika pembayaran selesai',
                ],
                'unfinished' => [
                    'label' => 'Url Redirect Belum Selesai',
                    'info' => 'Url redirect jika pembayaran belum selesai',
                ],
                'error' => [
                    'label' => 'Url Pembayaran Error',
                    'info' => 'Url redirect jika pembayaran terjadi error',
                ]
            ],
            'info_callback_url' => 'Salin  URL ini kedalam dashboard midtrans pada bagian <strong class="text-primary">"Settings -> Configuration"</strong><br/>URL ini sangat penting untuk validasi pada saat pelanggan melakukan pembayaran dengan channel pembayaran yang mereka inginkan',
        ],
    ],
    'activate' => [
        'menu' => 'Aktivasi Payment Gateway',
        'menu_info' => 'Bisa mengaktifkan payment gateway untuk pembayaran online',
    ],
    'cstore' => [
        'code' => 'Kode Pembayaran',
    ]
];
