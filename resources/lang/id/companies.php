<?php
return [
    'form_input' => [
        'name' => 'nama_client_radius',
        'address' => 'alamat_client_radius',
        'email' => 'email_client_radius',
        'postal' => 'kode_pos',
        'phone' => 'nomor_telepon_hp',
    ],
    'labels' => [
        'menu' => 'Client Radius',
        'menu_info' => 'Manajemen client radius',
        'search' => 'Cari Client Radius ...',
        'name' => 'Nama Client Radius',
        'code' => 'ID Client Radius',
        'address' => 'Alamat Client Radius',
        'email' => 'Email Client Radius',
        'postal' => 'Kode Pos',
        'phone' => 'Nomor Telepon / HP'
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
    'packages' => [
        'form_input' => [
            'discount' => 'diskon',
            'main_package' => 'paket_utama',
            'additional' => 'paket_tambahan',
            'additional_deleted' => 'hapus_paket_tambahan',
            'name' => 'nama_paket',
            'otp' => 'otp',
        ],
        'labels' => [
            'menu' => 'Paket Client Radius',
            'menu_info' => 'Manajemen paket client radius',
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
            'discount' => 'Diskon',
            'grand_total' => 'Grand Total'
        ],
    ]
];
