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
            'postal' => 'kode_pos'
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
        'menu' => 'Pelanggan',
        'menu_info' => 'Manajemen data pelanggan',
        'loading' => [
            'pending' => 'Memuat data pelanggan',
            'success' => 'Data Pelanggan berhasil dimuat',
            'error' => 'Gagal memuat data pelanggan',
        ],
        'search' => 'Cari Pelanggan ...',
        'type' => 'Jenis Pelanggan',
        'no_type' => 'Tidak ada jenis pelanggan',
        'name' => 'Nama Pelanggan',
        'not_found' => 'Tidak Ada Pelanggan',
        'code' => 'ID Pelanggan',
        'service' => [
            'tab' => 'Layanan Tambahan',
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
    ],
    'update' => [
        'button' => 'Rubah Pelanggan',
        'form' => 'Formulir Rubah Pelanggan',
    ],
    'delete' => [
        'button' => 'Hapus Pelanggan',
    ],
    'pppoe' => [
        'labels' => [
            'menu' => 'Pelanggan PPPoE',
            'menu_info' => 'Manajemen data pelanggan pppoe',
        ]
    ],
    'hotspot' => [
        'labels' => [
            'menu' => 'Pelanggan Hotspot',
            'menu_info' => 'Manajemen data pelanggan hotspot',
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
    ]
];
