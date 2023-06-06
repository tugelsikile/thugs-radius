<?php
/** @noinspection SpellCheckingInspection */
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
            'short' => 'IP'
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
        'labels' => [
            'menu' => 'Profile IP Pool',
            'menu_info' => 'Manage profile IP pool',
        ]
    ],
    'bandwidths' => [
        'labels' => [
            'menu' => 'Profile Bandwidth',
            'menu_info' => 'Manage profile bandwidths ',
        ]
    ],
    'profiles' => [
        'labels' => [
            'menu' => 'Layanan',
            'menu_info' => 'Manage layanan pelanggan',
        ]
    ],
];
