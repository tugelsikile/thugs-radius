<?php
return [
    'form_input' => [
        'id' => 'data_router',
        'name' => 'nama_router',
        'description' => 'keterangan_router',
        'type' => 'jenis_router',
        'method' => 'jenis_koneksi',
        'ip' => 'ip_router_koneksi',
        'domain' => 'domain_router_koneksi',
        'port' => 'port_router_koneksi',
        'user' => 'user_router_koneksi',
        'pass' => 'password_router_koneksi',
        'pass_confirm' => 'password_router_koneksi_confirmation',
        'expire_url' => 'url_expire',
    ],
    'labels' => [
        'menu' => 'Router [NAS]',
        'menu_info' => 'Manajemen Router [NAS]',
        'not_found' => 'Tidak ada data Router',
        'select' => 'Pilih Router [NAS]',
        'search' => 'Cari Router ...',
        'name' => 'Nama Router',
        'description' => 'Keterangan Router',
        'type' => 'Jenis Router',
        'method' => [
            'header' => 'Koneksi',
            'label' => 'Jenis Koneksi',
            'short' => 'Jenis'
        ],
        'domain' => [
            'label' => 'Domain Router',
            'short' => 'Domain',
            'info' => 'Pastikan router anda sudah diinstall domain dan ssl yang valid, Info lebih lanjut <a href="" target="_blank">klik disini</a>',
        ],
        'ip' => [
            'label' => 'IP Router Koneksi',
            'short' => 'IP / Hostname'
        ],
        'port' => [
            'label' => 'Port Router Koneksi',
            'short' => 'Port',
        ],
        'user' => [
            'label' => 'User Router Koneksi',
            'short' => 'User'
        ],
        'pass' => [
            'label' => 'Password Router Koneksi',
            'short' => 'Password',
            'confirm' => 'Konfirmasi Password Router',
        ],
        'status' => [
            'label' => 'Status Koneksi',
            'short' => 'Status',
        ],
        'expire_url' => 'URL Expire',
        'check_connection' => 'Periksa Sambungan',
        'connection' => [
            'type' => [
                'api' => 'Koneksi API',
                'ssl' => 'Koneksi SSL (https)',
            ],
            'failed' => 'Tidak dapat terhubung ke router',
            'success' => 'Berhasil terhubung ke ',
        ]
    ],
    'create' => [
        'limited' => 'Jumlah Maksimal Router Sudah Tercapai, Upgrade layanan anda untuk melanjutkan',
        'form' => 'Formulir Tambah Router',
        'btn' => 'Tambah Router',
        'button' => 'Tambah dan Simpan',
        'success' => 'Router berhasil ditambahkan',
    ],
    'update' => [
        'form' => 'Formulir Rubah Router',
        'btn' => 'Rubah Router',
        'button' => 'Simpan Perubahan',
        'success' => 'Router berhasil diubah',
    ],
    'delete' => [
        'warning' => 'Perhatian',
        'btn' => 'Hapus Router',
        'select' => 'Hapus Router Terpilih',
        'success' => 'Router berhasil dihapus',
    ],
    'select' => [
        'labels' => [
            'menu' => 'Pilih Router [NAS]',
            'menu_info' => 'Bisa pilih router untuk membuka dan memanage'
        ],
    ],
    'pools' => [
        'form_input' => [
            'id' => 'data_ip_pool',
            'name' => 'nama_ip_pool',
            'description' => 'keterangan_ip_pool',
            'upload' => 'upload_ke_router',
            'address' => [
                'first' => 'ip_pertama',
                'last' => 'ip_terakhir',
            ]
        ],
        'labels' => [
            'menu' => 'Profile IP Pool',
            'menu_info' => 'Manage profile IP pool',
            'not_found' => 'IP Pool Tidak Ditemukan !!',
            'search' => 'Cari IP Pool ...',
            'name' => 'Nama IP Pool',
            'description' => 'Keterangan IP Pool',
            'address' => [
                'first' => 'IP Pertama',
                'last' => 'IP Terakhir',
                'error' => 'IP Terakhir :ip blok ke :index (:block) tidak boleh kurang dari IP Pertama :ip2 blok ke :index2 (:block2)'
            ],
            'upload' => [
                'true' => 'Upload IP Pool ke router [NAS]',
                'false' => 'Jangan upload IP Pool ke router [NAS]'
            ],
            'invalid_name' => 'Nama IP Pool tidak boleh ada spasi'
        ],
        'create' => [
            'form' => 'Formulir Tambah IP Pool',
            'button' => 'Tambah IP Pool',
            'success' => 'IP Pool berhasil ditambahkan',
        ],
        'update' => [
            'form' => 'Formulir Rubah IP Pool',
            'button' => 'Rubah IP Pool',
            'success' => 'IP Pool berhasil dirubah',
        ],
        'delete' => [
            'button' => 'Hapus IP Pool',
            'select' => 'Hapus IP Pool Terpilih',
        ]
    ],
];
