<?php
return [
    'form_input' => [
        'period' => 'periode',
        'id' => 'data_petty_cash',
        'name' => 'judul',
        'description' => 'keterangan',
        'amount' => 'jumlah',
        'type' => 'jenis',
        'approve' => 'butuh_approval',
    ],
    'labels' => [
        'menu' => 'Kas Kecil',
        'menu_info' => 'Manajemen Kas Kecil',
        'name' => 'Judul',
        'time' => 'Jam',
        'period' => 'Periode',
        'input' => 'Pendapatan',
        'output' => 'Pengeluaran',
        'description' => 'Keterangan',
        'amount' => 'Jumlah',
        'type' => 'Jenis',
        'balance' => 'Saldo',
        'total' => 'Total',
        'approve' => [
            'need' => 'Membutuhkan Approval',
        ],
        'end_balance' => [
            'label' => 'Saldo Akhir',
            'last' => 'Saldo Akhir Bulan Lalu',
        ]
    ],
    'approve' => [
        'menu' => 'Approve Kas Kecil',
        'menu_info' => 'Mengizinkan pengguna untuk melakukan approval pada kas kecil',
        'success' => 'Kas Kecil berhasil diapprove',
        'confirm' => [
            'title' => 'Perhatian',
            'message' => 'Anda yakin ingin melakukan approval pada data ini ?',
            'yes' => 'Approve',
            'no' => 'Batal',
        ]
    ]
];
