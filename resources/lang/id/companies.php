<?php
/** @noinspection DuplicatedCode */
return [
    'form_input' => [
        'name' => 'nama_client_radius',
        'address' => 'alamat_client_radius',
        'email' => 'email_client_radius',
        'postal' => 'kode_pos',
        'phone' => 'nomor_telepon_hp',
    ],
    'labels' => [
        'no_select' => 'Tidak ada data client radius',
        'info' => 'Informasi Client Radius',
        'menu' => 'Client Radius',
        'menu_info' => 'Manajemen client radius',
        'search' => 'Cari Client Radius ...',
        'name' => 'Nama Client Radius',
        'code' => 'ID Client Radius',
        'address' => 'Alamat Client Radius',
        'email' => 'Email Client Radius',
        'postal' => 'Kode Pos',
        'phone' => 'Nomor Telepon / HP',
        'select' => 'Pilih client radius',
        'status' => [
            'active' => 'Aktif',
            'inactive' => 'Non Aktif',
        ],
        'table_columns' => [
            'code' => 'ID',
            'active' => 'Status Aktif',
            'name' => 'Nama Client Radius',
            'email' => 'Email',
            'expired' => [
                'at' =>  'Tgl. Expired',
            ],
        ]
    ],
    'create' => [
        'form' => 'Tambah Data Client Radius',
        'success' => 'Berhasil menambahkan data client radius',
        'button' => 'Tambah',
    ],
    'update' => [
        'form' => 'Rubah Data Client Radius',
        'success' => 'Berhasil merubah data client radius',
        'button' => 'Simpan',
    ],
    'delete' => [
        'form' => 'Hapus Data Client Radius',
        'confirm' => "Yakin ingin menghapus data client radius.\nData yang berhubungan akan ikut terhapus",
        'success' => 'Berhasil menghapus data client radius',
        'button' => 'Hapus',
        'select' => 'Hapus Client Radius Dipilih'
    ],
    'active' => [
        'confirm' => 'Rubah Status Aktif Client Radius',
        'form' => 'Rubah Status',
        'success' => 'Berhasil merubah status aktif client radius',
        'status' => [
            'active' => 'Aktifasi Client Radius',
            'inactive' => 'Nonaktifasi Client Radius',
        ]
    ],
    'packages' => [
        'form_input' => [
            'discount' => 'diskon',
            'main_package' => 'paket_utama',
            'additional' => 'paket_tambahan',
            'additional_deleted' => 'hapus_paket_tambahan',
            'name' => 'nama_paket',
            'otp' => 'otp',
            'description' => 'keterangan_paket',
            'price' => 'harga_paket',
            'vat' => 'persen_pajak',
            'duration_type' => 'jenis_durasi',
            'duration_ammount' => 'lama_durasi',
            'max_user' => 'max_pengguna',
            'max_customer' => 'max_pelanggan',
            'max_voucher' => 'max_voucher',
            'max_router' => 'max_nas_router',
        ],
        'labels' => [
            'duration_type' => 'Jenis Durasi',
            'duration_type_select' => 'Pilih Jenis Durasi',
            'description' => 'Keterangan Paket',
            'code' => 'Kode Paket',
            'menu' => 'Paket Client Radius',
            'name' => 'Nama Paket',
            'menu_info' => 'Manajemen paket client radius',
            'search' => 'Cari Paket Client Radius ...',
            'add' => 'Tambah Paket',
            'select' => 'Pilih paket client radius',
            'price' => 'Harga Paket',
            'vat' => '% pajak',
            'vat_price' => 'Harga Pajak',
            'sub_total' => 'Subtotal',
            'sub_total_before' => 'Subtotal Sebelum Pajak',
            'sub_total_vat' => 'Subtotal Pajak',
            'sub_total_after' => 'Subtotal Setelah Pajak',
            'total' => 'Grand Total',
            'duration' => 'Durasi',
            'duration_ammount' => 'Lama Durasi',
            'discount' => 'Diskon',
            'grand_total' => 'Grand Total',
            'max_user' => 'Max Pengguna',
            'max_customer' => 'Max Pelanggan',
            'max_voucher' => 'Max Voucher',
            'max_router' => 'Max NAS / Router',
            'table_columns' => [
                'code' => 'ID',
                'name' => 'Nama Paket',
                'price' => 'Harga',
                'vat' => 'Pajak',
                'duration' => 'Durasi',
                'max' => [
                    'main' => 'Maksimal',
                    'user' => 'Pengguna',
                    'customer' => 'Pelanggan',
                    'voucher' => 'Voucher',
                    'router' => 'NAS'
                ]
            ],
        ],
        'create' => [
            'form' => 'Tambah Data Paket Client Radius',
            'success' => 'Berhasil menambahkan paket data client radius',
            'button' => 'Tambah',
        ],
        'update' => [
            'form' => 'Rubah Data Paket Client Radius',
            'success' => 'Berhasil merubah data paket client radius',
            'button' => 'Simpan',
        ],
        'delete' => [
            'form' => 'Hapus Data Paket Client Radius',
            'confirm' => "Yakin ingin menghapus data paket client radius.\nData yang berhubungan akan ikut terhapus",
            'success' => 'Berhasil menghapus data paket client radius',
            'button' => 'Hapus',
            'select' => 'Hapus Paket Client Radius Dipilih'
        ],
    ],
    'invoices' => [
        'form_input' => [
            'name' => 'tagihan',
            'periode' => 'periode_tagihan',
            'discount' => 'diskon_tagihan',
            'vat' => 'pajak_tagihan',
            'code' => 'nomor_invoice',
            'package' => [
                'input' => 'paket',
                'name' => 'nama_paket',
                'price' => 'harga_layanan',
                'vat' => 'pajak_layanan',
                'qty' => 'jumlah_layanan',
                'discount' => 'diskon_layanan',
                'input_delete' => 'hapus_paket',
            ]
        ],
        'labels' => [
            'print' => 'Cetak Tagihan',
            'info' => 'Informasi Tagihan',
            'periode' => 'Periode Tagihan',
            'menu' => 'Tagihan Client Radius',
            'menu_info' => 'Manajemen tagihan client radius',
            'select_periode' => 'Pilih Periode Penagihan',
            'search' => 'Cari Tagihan ...',
            'code' => 'Nomor Invoice',
            'vat' => 'Pajak Tagihan',
            'status' => 'Status Tagihan',
            'discount' => 'Diskon Tagihan',
            'subtotal' => [
                'main' => 'Besar Tagihan',
                'item' => 'Subtotal',
            ],
            'package' => [
                'add' => 'Tambah Paket',
                'input' => 'Paket',
                'name' => 'Nama Paket',
                'price' => 'Harga',
                'vat' => '% Pajak',
                'qty' => 'Jumlah',
                'discount' => 'Diskon',
            ]
        ],
        'generate' => [
            'form' => 'Generate Tagihan',
        ],
        'create' => [
            'form' => 'Tambah Tagihan',
            'success' => 'Berhasil menambahkan tagihan client radius',
            'button' => 'Tambah',
        ],
        'update' => [
            'form' => 'Rubah Tagihan',
            'success' => 'Berhasil merubah data tagihan client radius',
            'button' => 'Simpan',
        ],
        'delete' => [
            'form' => 'Hapus Tagihan',
            'confirm' => "Yakin ingin menghapus data tagihan client radius.\nData yang berhubungan akan ikut terhapus",
            'success' => 'Berhasil menghapus data tagihan client radius',
            'button' => 'Hapus',
            'select' => 'Hapus Tagihan Dipilih'
        ],
        'payments' => [
            'form_input' => [
                'id' => 'pembayaran',
                'name' => 'pembayaran_tagihan',
                'delete' => 'hapus_pembayaran',
                'date' => 'tanggal_pembayaran',
                'note' => 'catatan_pembayaran',
                'amount' => 'jumlah_pembayaran',
                'max_amount' => 'maksimal_pembayaran',
            ],
            'labels' => [
                'success' => 'Pembayaran tagihan berhasil ditambahkan',
                'error_amount' => 'Total jumlah pembayaran melebihi besar tagihan',
                'menu' => 'Pembayaran Tagihan',
                'menu_info' => 'Melakukan pembayaran manual tagihan client radius',
                'button' => 'Simpan Pembayaran',
                'add' => 'Tambah Pembayaran',
                'code' => 'ID Pembayaran',
                'code_temp' => 'Akan Generate',
                'date' => 'Tgl. Pembayaran',
                'date_select' => 'Pilih Tgl. Bayar',
                'note' => 'Catatan Pembayaran',
                'by' => 'Oleh',
                'subtotal' => 'Subtotal Pembayaran',
                'amount' => 'Jml. Pembayaran',
                'amount_left' => 'Sisa Pembayaran',
                'status' => [
                    'pending' => 'Menunggu Pembayaran',
                    'success' => 'Lunas',
                    'partial' => 'Bayar Sebagian',
                ]
            ]
        ]
    ],
    'cps' => [
        'labels' => [
            'name' => 'Contact Person',
            'email' => 'Email CP.',
            'phone' => 'No. Telp. CP.'
        ]
    ]
];
