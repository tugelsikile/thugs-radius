<?php
return [
    'form_input' => [
        'id' => 'data_pengguna',
        'name' => 'nama_pengguna',
        'email' => 'alamat_email_pengguna',
        'require_nas' => 'ada_nas',
        'nas' => [
            'input' => 'input_nas',
            'id' => 'data_nas',
            'name' => 'nama_nas',
            'delete' => 'hapus_nas',
        ],
        'password' => [
            'current' => 'kata_sandi',
            'confirm' => 'kata_sandi_confirmation'
        ],
        'lang' => 'bahasa',
        'date_format' => 'format_tanggal'
    ],
    'labels' => [
        'menu' => 'Pengguna',
        'menu_info' => 'Manajemen pengguna aplikasi',
        'name' => 'Nama Pengguna',
        'email' => 'Alamat Email',
        'search' => 'Cari Pengguna ...',
        'last' => [
            'login' => 'Login Terakhir',
            'activity' => 'Aktifitas Terakhir',
        ],
        'select' => [
            'not_found' => 'Pengguna tidak ditemukan',
            'label' => 'Pilih Pengguna'
        ],
        'password' => [
            'current' => 'Kata Sandi',
            'confirm' => 'Konfirmasi Kata Sandi'
        ]
    ],
    'create' => [
        'button' => 'Tambah Pengguna',
        'form' => 'Formulir Tambah Pengguna',
        'submit' => 'Simpan dan Tambahkan Pengguna',
        'success' => 'Pengguna berhasil ditambahkan',
    ],
    'update' => [
        'button' => 'Rubah Pengguna',
        'form' => 'Formulir Rubah Pengguna',
        'submit' => 'Simpan Perubahan',
        'success' => 'Pengguna berhasil dirubah',
        'error_admin' => "Anda akan merubah pengguna dengan akses ADMIN.\nSedangkan jika pengguna ini dirubah menjadi selain ADMIN, maka anda tidak lagi memiliki semua fitur untuk admin.\nSilahkan ganti hak akses pengguna ini atau tambahkan lebih dulu pengguna dengan akses ADMIN.",
    ],
    'delete' => [
        'button' => 'Hapus Pengguna',
        'success' => 'Pengguna berhasil dihapus',
        'select' => 'Hapus Pengguna Terpilih',
        'confirm' => "Anda akan menghapus data pengguna!\nHati hati jika semua pengguna dihapus, maka anda tidak akan memiliki akses untuk aplikasi ini.\nLanjutkan Hapus Pengguna ?",
        'error_user' => "Anda akan menghapus seluruh pengguna pada aplikasi ini.\nAnda tidak bisa / diperbolehkan melakukan aksi ini.\nTerima Kasih."
    ],
    'privileges' => [
        'form_input' => [
            'name' => 'hak_akses_pengguna',
        ],
        'labels' => [
            'menu' => 'Hak Akses',
            'menu_info' => 'Manajemen hak akses pengguna aplikasi',
            'select' => [
                'not_found' => 'Tidak ada data hak akses',
                'label' => 'Pilih Hak Akses',
                'no_select' => 'Pilih hak akses terlebih dahulu',
                'no_menu' => 'Tidak ada menu / fungsi untuk hak akses ini',
            ],
        ],
        'create' => [
            'info' => 'Tambah data pengguna'
        ],
        'update' => [
            'button' => 'Rubah Hak Akses',
        ],
        'delete' => [
            'button' => 'Hapus Hak Akses',
        ]
    ],
    'resets' => [
        'labels' => [
            'menu' => 'Reset Kata Sandi Manual',
            'menu_info' => 'Mampu mereset kata sandi pengguna secara manual',
            'button' => 'Reset Kata Sandi',
            'confirm' => "Reset Kata Sandi pengguna dipilih?\nPastikan email dari pengguna tersebut valid dan dapat diakses.\nJika pengguna sedang login, maka pengguna akan dipaksa keluar."
        ]
    ]
];
