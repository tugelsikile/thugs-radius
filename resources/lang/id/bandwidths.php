<?php
return [
    'form_input' => [
        'id' => 'data_profile_bandwidth',
        'name' => 'nama_profile_bandwidth',
        'description' => 'keterangan_profile_bandwidth',
        'max_limit' => [
            'up' => 'max_limit_upload',
            'down' => 'max_limit_download'
        ],
        'burst' => [
            'up' => 'burst_limit_upload',
            'down' => 'burst_limit_download',
        ],
        'threshold' => [
            'up' => 'burst_threshold_upload',
            'down' => 'burst_threshold_download'
        ],
        'time' => [
            'up' => 'burst_time_upload',
            'down' => 'burst_time_download'
        ],
        'limit_at' => [
            'up' => 'limit_at_upload',
            'down' => 'limit_at_download'
        ],
        'priority' => 'priority',
    ],
    'labels' => [
        'menu' => 'Profile Bandwidth',
        'menu_info' => 'Manage profile bandwidths ',
        'name' => 'Nama Profile Bandwidth',
        'not_found' => 'Profile Bandwidth Tidak Ditemukan',
        'search' => 'Cari Profile Bandwidth ...',
        'description' => 'Keterangan Profile Bandwidth',
        'max_limit' => [
            'main' => 'Max Limit',
            'up' => 'Up',
            'up_long' => 'Max Limit Upload',
            'up_invalid' => 'Nilai Max Limit Upload tidak boleh lebih dari nilai Burst Limit Upload',
            'down' => 'Down',
            'down_long' => 'Max Limit Download',
            'down_invalid' => 'Nilai Max Limit Download tidak boleh lebih dari nilai Burst Limit Download',
        ],
        'burst_limit' => [
            'main' => 'Burst Limit',
            'up' => 'Up',
            'up_long' => 'Burst Limit Upload',
            'up_invalid' => 'Nilai Burst Time Upload tidak boleh bernilai 0 jika nilai Burst Limit Upload lebih dari 0',
            'down' => 'Down',
            'down_long' => 'Burst Limit Download',
            'down_invalid' => 'Nilai Burst Time Download tidak boleh bernilai 0 jika nilai Burst Limit Download lebih dari 0',
        ],
        'threshold' => [
            'main' => 'Burst Threshold',
            'up' => 'Up',
            'up_long' => 'Burst Threshold Upload',
            'up_invalid' => 'Nilai Burst Threshold Upload tidak boleh bernilai lebih dari nilai Burst Limit Upload',
            'down' => 'Down',
            'down_long' => 'Burst Threshold Download',
            'down_invalid' => 'Nilai Burst Threshold Download tidak boleh bernilai lebih dari nilai Burst Limit Download',
        ],
        'time' => [
            'main' => 'Burst Time',
            'up' => 'Up',
            'up_long' => 'Burst Time Upload',
            'down' => 'Down',
            'down_long' => 'Burst Time Download'
        ],
        'limit_at' => [
            'main' => 'Limit At',
            'up' => 'Up',
            'up_long' => 'Limit At Upload',
            'up_invalid' => 'Nilai Max Limit Upload tidak boleh lebih dari nilai Limit At Upload',
            'down' => 'Down',
            'down_long' => 'Limit At Download',
            'down_invalid' => 'Nilai Max Limit Upload tidak boleh lebih dari nilai Limit At Upload',
        ],
        'priority' => [
            'name' => 'Priority',
            'select' => 'Pilih Priority',
            'not_found' => 'Priority Tidak Ada',
        ],
        'queue' => [
            'name' => 'Parent Queue',
            'select' => 'Pilih Parent Queue',
            'not_found' => 'Tidak Ada Parent Queue',
            'target' => 'Target Address',
        ],
    ],
    'create' => [
        'button' => 'Tambah Bandwidth',
        'success' => 'Profile Bandwidth berhasil ditambahkan',
    ],
    'update' => [
        'button' => 'Rubah Bandwidth',
        'success' => 'Profile Bandwidth berhasil dirubah',
    ],
    'delete' => [
        'button' => 'Hapus Bandwidth',
        'warning' => 'Perhatian',
        'select' => 'Hapus Profile Bandwidth terpilih ?',
        'success' => 'Profile Bandwidth berhasil dihapus',
    ]
];
