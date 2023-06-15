<?php
return [
    'form_input' => [
        'id' => 'data_tagihan',
        'bill_period' => 'periode_penagihan',
    ],
    'labels' => [
        'loading' => [
            'pending' => 'Memuat data tagihan pelanggan',
            'success' => 'Berhasil memuat data tagihan pelanggan',
            'error' => 'Gagal memuat data tagihan pelanggan'
        ],
        'search' => 'Cari Tagihan ...',
        'not_found' => 'Tagihan tidak ditemukan',
        'bill_period' => [
            'label' => 'Periode Penagihan',
            'select' => 'Pilih periode penagihan',
        ],
        'code' => 'No. Invoice',
        'order_id' => 'Order ID',
        'amount' => [
            'label' => 'Jumlah Tagihan',
        ],
        'paid' => [
            'label' => 'Jumlah Dibayar',
            'date' => [
                'select' => 'Pilih tanggal lunas',
            ]
        ],
        'status' => [
            'label' => 'Status Tagihan',
        ]
    ],
    'generate' => [
        'button' => 'Generate Tagihan',
        'form' => 'Formulir Generate Tagihan',
        'submit' => 'Kirim dan Mulai Generate Tagihan',
        'success' => 'Tagihan berhasil digenerate',
        'info' => [
            'title' => "Perhatian !!",
            'text' => "Generate tagihan pelanggan harus memiliki kriteria dibawah ini :",
            'criteria' => [
                '1' => 'Status pelanggan adalah aktif',
                '2' => 'Status aktif pelanggan sebelum periode penagihan <em>Referesi input <b>Periode Penagihan</b></em>',
                '3' => 'Nilai tagihan tidak nol <em>(0)</em> setelah ditambahkan pajak dan dikurangi diskon',
                '4' => 'Tidak ada tagihan pada periode penagihan yang dipilih',
                '5' => 'Jika ingin menambahkan tagihan selain dengan 4 kriteria diatas, buat tagihan secara manual dengan gunakan tombol <b>Tambah Tagihan</b>',
            ]
        ]
    ],
    'create' => [
        'button' => 'Tambah Tagihan',
        'success' => 'Tagihan berhasil dibuat',
    ],
    'update' => [
        'button' => 'Rubah Tagihan',
        'success' => 'Tagihan berhasil dirubah',
    ],
    'delete' => [
        'warning' => 'Perhatian',
        'button' => 'Hapus Tagihan',
        'select' => 'Hapus Tagihan Terpilih',
        'success' => 'Tagihan berhasil dihapus',
    ]
];
