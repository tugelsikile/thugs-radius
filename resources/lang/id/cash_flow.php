<?php
return [
    'form_input' => [
        'id' => 'data_arus_kas',
        'code' => 'kode_transaksi',
        'periods' => [
            'label' => 'tanggal_transaksi',
            'start' => 'tanggal_mulai',
            'end' => 'tanggal_selesai',
        ],
        'amount' => 'besar_transaksi',
        'description' => 'keterangan_transaksi',
        'account' => [
            'label' => 'akun',
            'id' => 'data_akun',
            'name' => 'nama_akun',
            'description' => 'keterangan_akun',
        ],
        'category' => [
            'label' => 'kategori',
            'id' => 'data_kategori',
            'name' => 'nama_kategori',
            'description' => 'keterangan_kategori',
        ],
        'type' => 'jenis_transaksi',
    ],
    'labels' => [
        'menu' => 'Arus Kas',
        'menu_info' => 'Manajemen Arus Kas',
        'code' => 'Kode Transaksi',
        'account' => [
            'label' => 'Akun',
            'name' => 'Nama Akun',
            'description' => 'Keterangan Akun',
        ],
        'category' => [
            'label' => 'Kategori',
            'name' => 'Nama Kategori',
            'description' => 'Keterangan Kategori'
        ],
        'amount' => 'Jumlah Transaksi',
        'period' => 'Tanggal',
        'description' => 'Keterangan',
        'credit' => 'Kredit',
        'debit' => 'Debit',
        'type' => 'Jenis',
    ]
];
