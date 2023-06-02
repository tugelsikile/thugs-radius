<?php

return [
    'method' => 'Undefined method',
    'ok' => 'ok',
    'close' => 'Tutup',
    'action' => 'Aksi',
    'no_data' => 'Sementara data tidak ada',
    'otp' => 'One Time Payment (sekali bayar)',
    'menu' => [
        'name' => 'Nama Menu / Fungsi',
        'read' => 'Baca / Buka',
        'create' => 'Tambah',
        'update' => 'Rubah',
        'delete' => 'Hapus'
    ],
    'company' => [
        'labels' => [
            'search' => 'Cari client Radius...',
            'menu' => 'Client Radius',
            'menu_info' => 'Manajemen client radius / company',
            'name' => 'Nama Client Radius'
        ],
        'create' => [
            'form' => 'Tambah Data Client Radius',
            'success' => 'Berhasil menambahkan data client',
            'button' => 'Tambah',
        ],
        'update' => [
            'form' => 'Rubah Data Client Radius',
            'success' => 'Berhasil merubah data client',
            'button' => 'Simpan',
        ],
        'delete' => [
            'form' => 'Hapus Data Client Radius',
            'success' => 'Berhasil menghapus data client',
            'button' => 'Hapus',
        ],
        'select' => [
            'option' => 'Pilih Client Radius',
            'label' => 'Client',
            'select' => 'Hapus Client Dipilih',
        ],
        'packages' => [
            'labels' => [
                'menu' => 'Paket Client Radius',
                'menu_info' => 'Manajemen paket client radius'
            ],
        ],
        'invoice' => [
            'labels' => [
                'menu' => 'Tagihan Client Radius',
                'menu_info' => 'Manajemen tagihan pelanggan client radius',
                'payment' => 'Pembayaran Tagihan Client Radius',
                'payment_info' => 'Pembayaran tagihan client radius secara manual',
            ],
        ],
    ],
    'privileges' => [
        'form_input' => [
            'name' => 'nama_hak_akses',
            'description' => 'keterangan_hak_akses',
            'client' => 'untuk_client_radius',
            'company' => 'nama_client_radius'
        ],
        'labels' => [
            'info' => 'Informasi hak akses',
            'search' => 'Cari hak akses ...',
            'menu' => 'Hak Akses',
            'menu_info' => 'Manajemen hak akses pengguna',
            'name' => 'Nama Hak Akses',
            'super' => 'Super User',
            'client' => 'Untuk Client Radius',
            'description' => 'Keterangan hak akses',
        ],
        'create' => [
            'form' => 'Tambah Data Hak Akses',
            'success' => 'Berhasil menambahkan data hak akses',
            'button' => 'Tambah',
        ],
        'update' => [
            'form' => 'Rubah Data Hak Akses',
            'success' => 'Berhasil merubah data hak akses',
            'button' => 'Simpan',
        ],
        'delete' => [
            'form' => 'Hapus Data Hak Akses',
            'success' => 'Berhasil menghapus data hak akses',
            'button' => 'Hapus',
            'select' => 'Hapus Hak Akses Dipilih',
        ],
        'set' => [
            'success' => 'Aksi hak akses berhasil diubah',
            'vis' => 'Tampil / Sembunyikan Menu'
        ],
        'select' => [
            'option' => 'Pilih Hak Akses',
            'label' => 'Hak Akses',
        ]
    ],
    'users' => [
        'form_input' => [
            'level' => 'level_pengguna',
            'company' => 'nama_client_radius',
            'name' => 'nama_lengkap',
            'email' => 'alamat_email',
            'password' => 'kata_sandi',
            'password_confirm' => 'kata_sandi_confirmation',
            'lang' => 'bahasa',
            'date_format' => 'format_tanggal'
        ],
        'labels' => [
            'sign_out' => 'Keluar',
            'warning' => [
                'title' => "Bertanggung Jawab lah !!",
                'content' => 'Rubah dan hapus data dengan bertanggungjawab karena beberapa dan atau semua data terhubung dengan akun lainnya'
            ],
            'table_action' => 'Aksi',
            'signin_text' => 'Masuk untuk mulai sesi',
            'signin_button' => 'Masuk',
            'captcha' => 'Kode Keamanan',
            'search' => 'Cari pengguna ...',
            'name' => 'Nama Lengkap',
            'email' => 'Alamat Email',
            'password' => 'Kata Sandi',
            'password_confirm' => 'Konfirmasi Kata Sandi',
            'menu' => 'Pengguna',
            'menu_info' => 'Manajemen pengguna aplikasi',
            'lang' => [
                'label' => 'Bahasa',
                'select' => 'Pilih Bahasa',
            ],
            'date_format' => [
                'label' => 'Format Tanggal',
                'preview' => 'Pratinjau',
                'select' => 'Pilih Format Tanggal',
            ],
        ],
        'create' => [
            'form' => 'Tambah Data Pengguna',
            'success' => 'Berhasil menambahkan data pengguna',
            'button' => 'Tambah',
        ],
        'update' => [
            'form' => 'Rubah Data Pengguna',
            'password_change' => 'Kosongkan jika tidak ingin mengganti kata sandi',
            'success' => 'Berhasil merubah data pengguna',
            'button' => 'Simpan Perubahan',
        ],
        'delete' => [
            'form' => 'Hapus Data Pengguna',
            'success' => 'Berhasil menghapus pengguna',
            'button' => 'Hapus',
            'select' => 'Hapus Pengguna Dipilih',
            'warning' => 'Pengguna dipilih akan dihapus'
        ],
        'select' => [
            'option' => 'Pilih Pengguna',
            'label' => 'Pengguna',
        ]
    ]
];
