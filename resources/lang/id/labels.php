<?php
return [
    'form_input' => [
        'keywords' => 'kata_kunci',
        'search_type' => 'jenis_pencarian',
    ],
    'type' => 'Jenis :Attribute',
    'additional' => [
        'true' => ':Attribute Tambahan',
        'false' => ':Attribute Utama',
    ],
    'search' => 'Cari :Attribute ...',
    'not_found' => 'Sementara data :Attribute tidak ditemukan',
    'select' => [
        'option' => 'Pilih :Attribute',
        'not_found' => ':Attribute tidak ditemukan',
    ],
    'create' => [
        'label' => 'Tambah :Attribute',
        'form' => 'Formulir Tambah :Attribute',
        'submit' => 'Tambah dan Simpan :Attribute',
        'success' => ':Attribute berhasil ditambahkan'
    ],
    'update' => [
        'label' => 'Rubah :Attribute',
        'form' => 'Formulir Rubah :Attribute',
        'submit' => 'Simpan Perubahan :Attribute',
        'success' => ':Attribute berhasil disimpan'
    ],
    'delete' => [
        'label' => 'Hapus :Attribute',
        'confirm' => [
            'title' => 'Perhatian',
            'message' => 'Anda yakin ingin menghapus :Attribute ?',
            'confirm' => 'HAPUS',
            'cancel' => 'BATAL HAPUS',
        ],
        'select' => 'Hapus :Attribute terpilih',
        'success' => ':Attribute berhasil dihapus'
    ],
    'generate' => [
        'label' => 'Generate :Attribute',
        'form' => 'Formulir Generate :Attribute',
        'message' => "Anda akan melakukan generate :Attribute.\nLanjutkan generate :Attribute ?",
        'submit' => 'Generate :Attribute',
        'success' => ':Attribute berhasil digenerate'
    ],
    'active' => [
        'success' => 'Status aktif :Attribute berhasil dirubah',
        'button' => 'Aktifkan :Attribute',
        'confirm' => [
            'title' => 'Aktifkan :Attribute',
            'message' => "Status aktif :Attribute yang dipilih akan berubah menjadi aktif.\nAnda yakin ingin mengaktifkan :Attribute yang dipilih?",
            'confirm' => 'AKTIFKAN',
            'cancel' => 'BATAL AKTIFASI'
        ]
    ],
    'inactive' => [
        'success' => 'Status nonaktif :Attribute berhasil dirubah',
        'button' => 'Nonaktifkan :Attribute',
        'confirm' => [
            'title' => 'Nonaktifkan :Attribute',
            'message' => "Status aktif :Attribute yang dipilih akan berubah menjadi nonaktif.\nAnda yakin ingin menonaktifkan :Attribute yang dipilih?",
            'confirm' => 'NONAKTIFKAN',
            'cancel' => 'BATAL NONAKTIFASI'
        ]
    ],
    'confirm' => [
        'message' => "Anda yakin akan melakukan aksi ini ?",
        'title' => 'Perhatian',
        'yes' => 'Konfirmasi',
        'cancel' => 'Batal',
    ],
    'total' => 'Total :Attribute',
    'online' => ':Attribute Online',
    'offline' => ':Attribute Offline',
    'max' => 'Maksimal :Attribute',
    'min' => 'Minimal :Attribute'
];
