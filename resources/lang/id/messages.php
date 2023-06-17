<?php

return [
    'sorts' => [
        'dirs' => [
            'asc' => 'Menaik',
            'desc' => 'Menurun'
        ]
    ],
    'filter' => 'Filter',
    'confirm' => 'Konfirmasi',
    'cancel' => 'Batal',
    'method' => 'Undefined method',
    'ok' => 'ok',
    '404' => '404 Page Not Found',
    'required' => 'Harus diisi / dipilih',
    'undefined' => 'Undefined message',
    'save' => 'Simpan',
    'close' => 'Tutup',
    'action' => 'Aksi',
    'no_data' => 'Sementara data tidak ada',
    'otp' => 'One Time Payment (sekali bayar)',
    'menu' => [
        'label' => 'Daftar Menu / Fungsi',
        'info' => [
            'label' => 'Izinkan pengguna untuk :type :menu',
            'dont' => 'Jangan izinkan pengguna untuk :type :menu',
        ],
        'name' => [
            'label' => 'Nama Menu',
            'info' => 'Nama menu atau fungsi berdasarkan penggunaannya'
        ],
        'read' => [
            'label' => 'Baca',
            'do' => 'membaca / membuka / eksekusi',
            'info' => 'Pengguna dengan akses dipilih, diperbolehkan membuka, membaca, atau eksekusi aksi ini'
        ],
        'create' => [
            'label' => 'Tambah',
            'do' => 'menambah',
            'info' => 'Pengguna dengan akses dipilih, diperbolehkan menambahkan atau membuat data berdasarkan aksi ini'
        ],
        'update' => [
            'label' => 'Rubah',
            'do' => 'merubah',
            'info' => 'Pengguna dengan akses dipilih, diperbolehkan merubah data berdasarkan aksi ini',
        ],
        'delete' => [
            'label' => 'Hapus',
            'do' => 'menghapus',
            'info' => 'Pengguna dengan akses dipilih, diperbolehkan menghapus data berdasarkan aksi ini',
        ]
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
            'select' => "Anda akan menghapus hak akses yang telah dipilih.\nBeberapa data yang bersangkutan dengan hak akses tersebut akan ikut terhapus.\nAnda yakin ingin melanjutkan menghapus data ini?",
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
