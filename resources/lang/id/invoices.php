<?php
return [
    'form_input' => [
        'id' => 'data_tagihan',
        'bill_period' => 'periode_penagihan',
        'total' => 'total_tagihan',
        'note' => 'catatan_tagihan',
        'service' => [
            'input' => 'layanan_tagihan',
            'id' => 'data_layanan_tagihan',
            'delete' => 'hapus_layanan_tagihan',
        ],
        'taxes' => [
            'input' => 'pajak_tagihan',
            'id' => 'data_pajak_tagihan',
            'delete' => 'hapus_pajak_tagihan',
        ],
        'discounts' => [
            'input' => 'diskon_tagihan',
            'id' => 'data_diskon_tagihan',
            'delete' => 'hapus_diskon_tagihan',
        ],
    ],
    'labels' => [
        'loading' => [
            'pending' => 'Memuat data tagihan pelanggan untuk periode :bill_period',
            'success' => 'Berhasil memuat data tagihan pelanggan untuk periode :bill_period',
            'error' => 'Gagal memuat data tagihan pelanggan untuk periode :bill_period'
        ],
        'sorts' => [
            'code' => 'Urut berdasarkan No. Invoice :dir',
            'id' => 'Urut berdasarkan Order ID :dir',
            'name' => 'Urut berasarkan Nama Pelanggan :dir',
            'amount' => 'Urut berasarkan Jumlah Tagihan :dir',
            'paid' => 'Urut berdasarkan Jumlah Pembayaran :dir',
            'status' => 'Urut berasarkan Status Tagihan :dir',
        ],
        'service' => [
            'add' => 'Tambah Layanan',
            'delete' => 'Hapus Layanan',
            'select' => [
                'label' => 'Pilih Layanan',
                'not_found' => 'Tidak ada layanan',
            ],
            'total' => [
                'sub' => 'Subtotal',
            ],
        ],
        'taxes' => [
            'add' => 'Tambah Pajak',
            'delete' => 'Hapus Pajak',
            'select' => [
                'label' => 'Pilih Pajak',
                'not_found' => 'Tidak ada pajak',
            ],
            'percent' => '% Pajak',
            'value' => 'Nilai Pajak',
            'total' => [
                'sub' => 'Total Pajak',
                'label' => 'Pajak Tagihan',
            ]
        ],
        'discounts' => [
            'add' => 'Tambah Diskon',
            'delete' => 'Hapus Diskon',
            'select' => [
                'label' => 'Pilih Diskon',
                'not_found' => 'Tidak ada diskon',
            ],
            'amount' => 'Nilai Diskon',
            'total' => [
                'sub' => 'Total Diskon',
                'label' => 'Diskon Tagihan'
            ]
        ],
        'will_generate' => 'Akan digenerate',
        'search' => 'Cari Tagihan ...',
        'not_found' => 'Tagihan tidak ditemukan',
        'note' => 'Catatan Tagihan',
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
            'select' => [
                'label' => 'Pilih Status Tagihan',
                'not_found' => 'Status tagihan tidak ditemukan',
            ]
        ],
        'cards' => [
            'total' => 'Total Tagihan',
            'paid' => 'Total Pembayaran',
            'pending' => 'Sisa Pembayaran',
            'tax' => 'Pajak',
        ],
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
    'info' => [
        'button' => 'Informasi Tagihan',
        'submit' => '',
        'form' => 'Informasi Detail Tagihan'
    ],
    'create' => [
        'button' => 'Tambah Tagihan',
        'success' => 'Tagihan berhasil dibuat',
        'submit' => 'Simpan dan Tambahkan Tagihan',
        'form' => 'Formulir Tambah Tagihan',
    ],
    'update' => [
        'button' => 'Rubah Tagihan',
        'success' => 'Tagihan berhasil dirubah',
        'submit' => 'Simpan Perubahan',
        'form' => 'Formulir Rubah Tagihan',
    ],
    'delete' => [
        'warning' => 'Perhatian',
        'button' => 'Hapus Tagihan',
        'select' => 'Hapus Tagihan Terpilih',
        'success' => 'Tagihan berhasil dihapus',
    ],
    'payments' => [
        'success' => 'Pembayaran tagihan berhasil disimpan',
        'button' => 'Bayar Tagihan Manual',
        'add' => 'Tambah Pembayaran',
        'form' => 'Formulir Pembayaran Tagihan Secara Manual',
        'submit' => 'Simpan Pembayaran',
        'name' => 'Pembayaran Tagihan',
        'date' => [
            'label' => 'Tanggal',
            'select' => 'Pilih tanggal pembayaran',
        ],
        'note' => [
            'label' => 'Catatan',
            'input' => 'Isikan catatan pembayaran'
        ],
        'amount' => [
            'label' => 'Jumlah',
            'input' => 'Isikan jumlah pembayaran',
            'total' => 'Total Pembayaran',
            'left' => 'Sisa Pembayaran',
        ],
        'by' => 'Oleh',
        'form_input' => [
            'id' => 'data_tagihan',
            'payment' => [
                'input' => 'pembayaran',
                'id' => 'data_pembayaran',
                'note' => 'catatan_pembayaran',
                'date' => 'tanggal_pembayaran',
                'amount' => 'jumlah_pembayaran',
                'delete' => 'hapus_pembayaran',
            ],
            'total' => [
                'payment' => 'total_pembayaran',
                'invoice' => 'total_tagihan',
            ],
        ],
    ]
];
