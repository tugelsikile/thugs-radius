<?php
return [
    'form_input' => [
        'id' => 'data_pelanggan',
        'type' => 'jenis_pelanggan',
        'name' => 'nama_pelanggan',
        'address' => [
            'street' => 'nama_jalan',
            'village' => 'kelurahan_desa',
            'district' => 'kecamatan',
            'city' => 'kabupaten_kota',
            'province' => 'provinsi',
            'postal' => 'kode_pos',
            'phone' => 'nomor_whatsapp',
        ],
        'username' => 'nama_pengguna',
        'password' => 'kata_sandi',
        'email' => 'alamat_email',
        'service' => [
            'input' => 'layanan_tambahan',
            'id' => 'data_layanan_tambahan',
            'name' => 'nama_layanan_tambahan',
            'delete' => 'hapus_layanan_tambahan',
        ],
        'taxes' => [
            'input' => 'pajak',
            'id' => 'data_pajak',
            'name' => 'nama_pajak',
            'delete' => 'hapus_pajak',
        ],
        'discounts' => [
            'input' => 'diskon',
            'id' => 'data_diskon',
            'name' => 'nama_diskon',
            'delete' => 'hapus_diskon',
        ]
    ],
    'labels' => [
        'select' => [
            'label' => 'Pilih Pelanggan',
            'not_found' => 'Pelanggan tidak ditemukan',
        ],
        'menu' => 'Pelanggan',
        'menu_info' => 'Manajemen data pelanggan',
        'loading' => [
            'pending' => 'Memuat data pelanggan',
            'success' => 'Data Pelanggan berhasil dimuat',
            'error' => 'Gagal memuat data pelanggan',
        ],
        'search' => 'Cari Pelanggan ...',
        'type' => 'Jenis Pelanggan',
        'type_short' => 'Tipe',
        'no_type' => 'Tidak ada jenis pelanggan',
        'name' => 'Nama Pelanggan',
        'not_found' => 'Tidak Ada Pelanggan',
        'code' => 'ID Pel.',
        'status' => [
            'label' => 'Status',
            'active' => 'AKTIF',
            'activate' => 'Aktifasi',
            'message_activate' => "Aktifasi pelanggan ?\nPelanggan aktif akan mulai dihitung dan bisa untuk terhubung ke jaringan",
            'inactive' => 'NON AKTIF',
            'inactivate' => 'Nonaktifasi',
            'message_inactivate' => "Nonaktifasi pelanggan ?\nPelanggan non aktif tidak bisa terhubung ke jaringan.\nTagihan berjalan tidak akan dihapus",
            'register' => 'TERDAFTAR',
            'warning' => 'Perhatian',
            'success' => 'Status Aktif pelanggan berhasil dirubah',
            'expired' => 'Kadaluarsa',
            'generated' => 'Generated',
            'used' => 'Dipakai',
            'select' => [
                'label' => 'Pilih Status',
                'not_found' => 'Status tidak ditemukan',
            ]
        ],
        'service' => [
            'tab' => 'Layanan Tambahan',
            'grand_total' => [
                'label' => 'Grand Total',
            ],
            'select' => [
                'label' => 'Pilih Layanan Tambahan',
                'not_found' => 'Tidak ada layanan tambahan',
            ],
            'taxes' => [
                'label' => 'Pajak Layanan',
                'add' => 'Tambah Pajak',
                'subtotal' => 'Total Pajak',
                'select' => [
                    'label' => 'Pilih Pajak',
                    'not_found' => 'Tidak ada pajak',
                ]
            ],
            'discount' => [
                'label' => 'Diskon',
                'add' => 'Tambah Diskon',
                'subtotal' => 'Total Diskon',
                'select' => [
                    'label' => 'Pilih Diskon',
                    'not_found' => 'Tidak ada diskon',
                ],
            ],
            'name' => 'Nama Layanan',
            'type' => 'Jenis',
            'main' => 'Utama',
            'add' => 'Tambahan',
            'price' => 'Harga',
            'not_found' => 'Tidak ada layanan tambahan',
            'add_btn' => 'Tambah Layanan Tambahan',
            'subtotal' => [
                'label' => 'Subtotal',
            ]
        ],
        'address' => [
            'tab' => 'Alamat',
            'street' => 'Nama Jalan',
            'postal' => 'Kode Pos',
            'email' => 'Alamat Email',
            'phone' => 'No. Whatsapp',
            'call' => 'Kirim Pesan Whatsapp',
        ],
        'username' => [
            'label' => 'Nama Pengguna',
            'errors' => [
                'whitespace' => 'Tidak boleh ada spasi pada kolom nama pengguna',
            ]
        ],
        'password' => [
            'label' => 'Kata Sandi',
            'whitespace' => 'Tidak boleh ada spasi pada kolom kata sandi',
        ],
        'due' => [
            'at' => 'Tgl. Expired',
        ]
    ],
    'create' => [
        'button' => 'Tambah Pelanggan',
        'form' => 'Formulir Tambah Pelanggan',
        'success' => 'Berhasil menambahkan data pelanggan'
    ],
    'update' => [
        'button' => 'Rubah Pelanggan',
        'form' => 'Formulir Rubah Pelanggan',
        'success' => 'Berhasil merubah data pelanggan',
    ],
    'delete' => [
        'button' => 'Hapus Pelanggan',
        'warning' => 'Perhatian !',
        'select' => "Hapus pelanggan dipilih ?\nData dihapus tidak dapat dikembalikan",
        'success' => 'Berhasil menghapus data pelanggan'
    ],
    'pppoe' => [
        'labels' => [
            'menu' => 'Pelanggan PPPoE',
            'menu_info' => 'Manajemen data pelanggan pppoe',
        ]
    ],
    'hotspot' => [
        'form_input' => [
            'username' => 'nama_pengguna',
            'password' => 'kata_sandi',
        ],
        'labels' => [
            'menu' => 'Pelanggan Hotspot',
            'menu_info' => 'Manajemen data pelanggan hotspot',
            'status' => [
                'generated' => 'GENERATED',
                'used' => 'DIPAKAI'
            ]
        ],
        'generate' => [
            'success' => 'Berhasil generate voucher hotspot',
            'progress' => [
                'title' => 'Memulai generate voucher hotspot',
                'warning' => 'Jangan tutup / refresh halaman ini sebelum selesai',
                'span' => 'Memproses :current dari :total voucher (:percent) Selesai',
            ],
            'separator' => [
                'label' => 'Pemisah',
                'every' => 'Pisahkan Setiap'
            ],
            'qty' => 'Jumlah Voucher',
            'max' => 'Batas maksimal jumlah generate adalah 5000 voucher',
            'length_max' => ':parent tidak boleh lebih dari :length',
            'preview' => 'Preview Alokasi Nama User dan Kata Sandinya',
            'usernames' => [
                'label' => 'Nama User',
                'format' => 'Format Nama User',
                'random' => 'Panjang Acak Nama User',
                'length' => 'Panjang Nama User',
                'invalid_length' => 'Panjang format nama user lebih besar dari maksimal panjang nama user',
                'length_max' => 'Maksimal panjang nama user adalah :length karakter',
                'type' => 'Jenis Nama User',
                'preview' => 'Pratinjau Nama User',
                'prefix' => [
                    'true' => 'Format jenis nama user di depan',
                    'false' => 'Format jenis nama user di belakang'
                ]
            ],
            'passwords' => [
                'label' => 'Kata Sandi',
                'format' => 'Format Kata Sandi',
                'random' => 'Panjang Acak Kata Sandi',
                'length' => 'Panjang Kata Sandi',
                'invalid_length' => 'Panjang format kata sandi lebih besar dari maksimal panjang kata sandi',
                'length_max' => 'Maksimal panjang kata sandi adalah :length karakter',
                'type' => 'Jenis Kata Sandi',
                'preview' => 'Pratinjau Kata Sandi',
                'prefix' => [
                    'true' => 'Format jenis kata sandi di depan',
                    'false' => 'Format jenis kata sandi di belakang'
                ]
            ],
            'types' => [
                'none' => 'Jangan pakai format',
                'alnum' => 'Campuran Angka dan Huruf (Kecil dan Kapital)',
                'alnum-lower' => 'Campuran Angka dan Huruf Kecil',
                'alnum-upper' => 'Campuran Angka dan Huruf Kapital',
                'alpha' => 'Campuran Huruf (Kecil dan Kapital)',
                'alpha-lower' => 'Campuran Huruf Kecil',
                'alpha-upper' => 'Campuran Huruf Kapital',
                'numeric' => 'Campuran Angka'
            ],
            'button' => 'Generate Voucher Hotspot',
            'form' => 'Form Generate Voucher Hotspot',
            'submit' => 'Generate Sekarang',
        ],
        'vouchers' => [
            'batch' => 'Batch',
            'menu' => 'Voucher Hotspot',
            'delete' => 'Hapus Voucher',
            'update' => 'Rubah Voucher'
        ]
    ],
    'invoices' => [
        'labels' => [
            'menu' => 'Tagihan Pelanggan',
            'menu_info' => 'Manajemen tagihan pelanggan',
        ],
        'payments' => [
            'labels' => [
                'menu' => 'Pembayaran tagihan pelanggan',
                'menu_info' => 'Melakukan pembayaran tagihan pelanggan secara manual',
            ]
        ],
    ],
    'menus' => [
        'service' => 'Layanan',
        'invoice' => 'Tagihan',
    ]
];
