<?php
return [
    'form_input' => [
        'id' => 'data_olt',
        'name' => 'nama_olt',
        'host' => 'hostname',
        'port' => 'port',
        'read' => 'community_baca',
        'write' => 'community_tulis',
        'user' => 'username',
        'pass' => 'password',
        'onu' => 'data_onu',
        'phase_state' => 'phase_state',
        'customer' => 'data_pelanggan',
        'brand' => 'merek_olt',
        'model' => 'model_olt',
        'prompts' => [
            'user' => 'prompt_username',
            'pass' => 'prompt_password',
        ],
        'onus' => [
            'type' => 'onu_type',
            'brand' => 'merek_modem',
            'current' => 'port_onu_lama',
            'olt' => 'port_olt',
            'index' => 'index_onu',
            'name' => 'gpon_name',
            'description' => 'gpon_description',
            'sn' => 'serial_number',
            'tcont' => [
                'input' => 'tcont',
                'id' => 'id_tcont',
                'profile' => 'profile_tcont',
            ],
            'gemport' => [
                'input' => 'gemport',
                'id' => 'id_gemport',
                'downstream' => 'downstream',
                'upstream' => 'upstream',
            ],
            'vlan' => [
                'input' => 'vlan',
                'port' => 'port_vlan',
                'vport' => 'vport_vlan',
                'user' => 'user_vlan',
                'service' => 'service_vlan',
            ],
            'pon_mng' => [
                'input' => 'pon_management',
                'name' => 'nama_pon_management',
                'vlan' => 'vlan_pon_management'
            ]
        ]
    ],
    'labels' => [
        'menu' => 'OLT',
        'menu_info' => 'Manajemen OLT',
        'form_info' => 'Saat ini kami menggunakan <em class="text-primary">telnet</em> untuk komunikasi antara <em class="text-info">sistem</em> dengan <em class="text-danger">olt</em>, maka dari itu mohon gunakan variabel <em class="text-primary">telnet</em> untuk konfigurasi disamping ini.',
        'name' => 'Nama OLT',
        'host' => 'Hostname',
        'port' => 'Port',
        'detail' => 'Manage OLT',
        'uptime' => 'Uptime',
        'username' => 'Nama Pengguna',
        'password' => 'Kata Sandi',
        'brand' => 'Merek OLT',
        'model' => 'Model OLT',
        'onu' => [
            'brand' => 'Merek Modem',
            'index' => 'Index Onu',
            'name' => 'Nama Onu',
            'description' => 'Deskripsi Onu',
            'type' => 'Onu Type',
            'sn' => 'Serial Number',
            'distance' => 'ONU Dist.',
            'duration' => 'Durasi Online',
            'un_configure' => [
                'menu' => 'Hapus Konfigurasi GPon',
                'info' => 'Hapus Konfigurasi GPon yang dipilih (awas salah)',
            ],
        ],
        'pon_mng' => [
            'vlan' => 'Pon Management VLan'
        ],
        'customers' => [
            'link' => 'Hubungkan ke Pelanggan',
            'unlink' => 'Putuskan Hubungan Pelanggan',
            'link_unlink' => [
                'menu' => 'Hubungkan dan atau putuskan hubungan GPon pelanggan',
                'info' => 'Bisa menghubungkan dan atau memutuskan hubungan GPon pelanggan (bukan konfigurasi)',
            ]
        ],
        'loss' => 'LOS',
        'community' => [
            'label' => 'Community',
            'read' => 'Community Baca',
            'write' => 'Community Tulis',
        ],
        'prompts' => [
            'info' => 'Digunakan untuk mencoba pada saat login ke olt, Zte biasa pakai <strong><em>U</em>sername</strong> dengan <strong>U</strong> kapital',
            'user' => 'Prompt Username',
            'pass' => 'Prompt Kata Sandi'
        ],
        'preview' => 'Pratinjau Perintah Telnet OLT',
    ],
    'un_configure' => [
        'button' => 'Unconfig dan Hapus Hubungan Pelanggan',
        'confirm' => [
            'title' => 'Perhatian',
            'message' => "Unconfig dan hapus hubungan pelanggan\nData pelanggan tidak akan dihapus, hanya konfigurasi olt saja yang dihapus.\nLanjutkan unconfig dan putuskan hubungan pelanggan ?",
            'yes' => 'Konfirmasi dan Lanjutkan',
            'cancel' => 'Batal',
        ],
    ],
    'configure' => [
        'button' => 'Registrasi GPon',
        'title' => 'Formulir Registrasi GPon',
        'pending' => 'Menyimpan Config',
        'submit' => 'Simpan Config',
        'success' => 'Registrasi GPon berhasil disimpan',
    ],
    'cards' => [
        'ports' => [
            'count' => 'Jumlah Port',
            'used' => 'Port Terpakai',
            'available' => 'Port Tersedia',
        ]
    ]
];
