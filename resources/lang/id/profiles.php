<?php
return [
    'form_input' => [
        'id' => 'data_profile',
        'name' => 'nama_profile',
        'type' => 'jenis_profile',
        'is_additional' => 'layanan_tambahan',
        'code' => 'nama_profile_mikrotik',
        'queue' => [
            'name' => 'parent_queue',
            'id' => 'id_queue',
            'target' => 'target'
        ],
        'description' => 'keterangan_profile',
        'price' => 'harga_layanan',
        'limitation' => [
            'type' => 'jenis_limitasi',
            'rate' => 'besar_limitasi',
            'unit' => 'unit_limitasi',
        ],
        'address' => [
            'local' => 'local_address',
            'dns' => 'dns_servers',
            'subnet' => 'subnet_mask',
        ]
    ],
    'labels' => [
        'loading' => [
            'pending' => 'Memuat data layanan',
            'success' => 'Berhasil memuat data layanan',
            'error' => 'Gagal memuat data layanan',
        ],
        'menu' => 'Layanan',
        'menu_info' => 'Manage layanan pelanggan',
        'code' => [
            'label' => 'Nama Mikrotik :Attribute Profile',
            'info' => 'Akan disimpan sebagai Nama Profile :Attribute Mikrotik didalam router mikrotik',
            'error' => 'Nama Profile :Attribute Mikrotik tidak boleh ada spasi',
        ],
        'not_found' => 'Tidak ada data layanan',
        'select' => 'Pilih Layanan',
        'search' => 'Cari Layanan ...',
        'name' => 'Nama Layanan',
        'short_name' => 'Layanan',
        'name_invalid' => 'Nama Layanan tidak boleh ada spasi',
        'price' => 'Harga Layanan',
        'type' => 'Jenis Layanan',
        'description' => 'Keterangan Layanan',
        'additional' => [
            'name' => 'Layanan Tambahan ?',
            'info_true' => 'Ini adalah layanan tambahan',
            'info_false' => 'Ini bukan layanan tambahan',
        ],
        'validity' => [
            'rate' => 'Durasi Layanan',
            'unit' => 'Jenis Durasi Layanan',
        ],
        'service_type' => 'Jenis Profile',
        'limitation' => [
            'name' => 'Limitasi',
            'type' => 'Jenis Limitasi',
            'select' => 'Pilih Jenis Limitasi',
            'value' => 'Banyak Limit',
        ],
        'address' => [
            'local' => 'Local Address',
            'dns' => 'DNS Servers',
            'add_dns' => 'Tambah DNS Server',
            'remove_dns' => 'Hapus DNS Server',
            'interface' => 'Interface',
        ],
        'customers' => [
            'length' => 'Jml. Pelanggan',
        ]
    ],
    'create' => [
        'button' => 'Tambah Layanan',
        'form' => 'Formulir Tambah Layanan',
        'success' => 'Berhasil menambah data layanan',
    ],
    'update' => [
        'button' => 'Ubah Layanan',
        'form' => 'Formulir Rubah Layanan',
        'success' => 'Berhasil merubah data layanan',
    ],
    'delete' => [
        'button' => 'Hapus Layanan',
        'success' => 'Berhasil menghapus data layanan',
        'warning' => 'Perhatian',
        'select' => "Hapus data profile terpilih ?\n Aksi tidak dapat dikembalikan"
    ]
];
