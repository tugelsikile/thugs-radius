<?php
return [
    'promises' => [
        'pending' => 'Membuat konfigurasi',
        'success' => 'Konfigurasi berhasil dimuat',
        'error' => 'Konfigurasi gagal dimuat',
    ],
    'labels' => [
        'menu' => 'Konfigurasi',
        'menu_info' => 'Konfigurasi aplikasi',
    ],
    'site' => [
        'update' => [
            'success' => 'Konfigurasi situs berhasil disimpan',
        ],
    ],
    'address' => [
        'form' => 'Konfigurasi Nama, Logo, dan Alamat Perusahaan',
        'success' => 'Data perusahaan dan alamat berhasil disimpan',
        'form_input' => [
            'delete_logo' => 'hapus_logo',
            'id' => 'data_perusahaan',
            'name' => 'nama_perusahaan',
            'email' => 'email_perusahaan',
            'phone' => 'nomor_whatsapp',
            'postal' => 'kode_pos',
            'street' => 'nama_jalan',
            'village' => 'nama_kelurahan_desa',
            'district' => 'nama_kecamatan',
            'city' => 'nama_kabupaten_kota',
            'province' => 'nama_provinsi',
            'logo' => 'logo_perusahaan',
        ],
        'name' => 'Nama Perusahaan',
        'email' => 'Email Perusahaan',
        'phone' => 'No. Whatsapp',
        'postal' => 'Kode Pos',
        'street' => 'Nama Jalan',
        'village' => [
            'label' => 'Kelurahan / Desa',
            'select' => [
                'label' => 'Pilih Kelurahan / Desa',
                'no_option' => 'Tidak ada kelurahan / desa'
            ],
        ],
        'district' => [
            'label' => 'Kecamatan',
            'select' => [
                'label' => 'Pilih Kecamatan',
                'no_option' => 'Tidak ada kecamatan'
            ],
        ],
        'city' => [
            'label' => 'Kabupaten / Kota',
            'select' => [
                'label' => 'Pilih Kabupaten / Kota',
                'no_option' => 'Tidak ada kabupaten / kota'
            ],
        ],
        'province' => [
            'label' => 'Provinsi',
            'select' => [
                'label' => 'Pilih Provinsi',
                'no_option' => 'Tidak ada provinsi'
            ],
        ],
        'logo' => [
            'label' => 'Logo Perusahaan',
            'change' => 'Ganti logo perusahaan',
            'select' => 'Pilih logo perusahaan',
            'max' => 'Ukuran file logo perusahaan maksimal adalah 5 Mb, saat ini ukuran file adalah :size',
            'min' => 'Ukuran file logo perusahaan minimal adalah 10 Kb, saat ini ukuran file adalah :size',
            'error' => "Terjadi galat pada saat memuat file.\nUlangi mengambil gambar lagi",
            'delete' => 'Hapus Logo Perusahaan',
            'limitation' => "File harus berupa gambar dengan ukuran maksimal 5 Mb dan tidak kurang dari 10 Kb dengan lebar dan tinggi minimal 200 pixel dan maksimal 700 pixel, dengan tinggi dan lebar yang sama",
            'dimension' => 'Dimensi panjang dan lebar file logo tidak sama, dimensi sekarang adalah :width x :height',
            'width' => [
                'max' => 'Dimensi lebar file logo perusahaan adalah maksimal 700 pixel, lebar file adalah :size',
                'min' => 'Dimensi lebar file logo perusahaan adalah minimal 200 pixel, lebar file adalah :size'
            ],
            'height' => [
                'max' => 'Dimensi tinggi file logo perusahaan adalah maksimal 700 pixel, tinggi file adalah :size',
                'min' => 'Dimensi tinggi file logo perusahaan adalah minimal 200 pixel, tinggi file adalah :size'
            ]
        ],
        'submit' => 'Simpan'
    ]
];
