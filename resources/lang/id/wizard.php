<?php
return [
    'labels' => [
        'menu' => 'Panduan Konfigurasi',
        'title' => 'Selamat Datang di Panduan Konfigurasi Awal :Attribute',
    ],
    'steps' => [
        'skip' => 'Lewati Langkah Ini',
        '0' => [
            'menu' => 'Bahasa',
            'icon' => 'fas fa-flag',
            'message' => 'Kami akan menuntun anda untuk melakukan konfigurasi dan pengenalan menu yang ada di aplikasi ini<br/>Sebagai langkah awal pilihlah bahasa yang anda akan gunakan di aplikasi ini<br/><small class="text-info"><strong>Catatan</strong>: Penggantian bahasa bisa dilakukan kapan saja</small>',
        ],
        '1' => [
            'menu' => 'Data Perusahaan',
            'icon' => 'fas fa-building',
            'message' => 'Terima Kasih untuk pemilihan bahasanya.<br/>Selanjutnya kami menuntun anda untuk melengkapi profil perusahaan anda. Silahkan isi sesuai input dibawah ini ',
        ],
        '2' => [
            'menu' => 'Checklist Router [NAS]',
            'icon' => 'fas fa-server',
            'message' => 'Terima kasih telah mengisi data lengkap perusahaan anda.<br/>Mari kita lanjutkan dengan membuat sebuah <strong class="text-primary">NAS</strong> atau <strong class="text-primary">Router</strong>. Nas bisa diartikan atau difungsikan sebagai alat atau media yang menghubungkan pelanggan anda dengan <strong class="text-primary">SISTEM RADIUS</strong> kami. Agar berjalan dengan baik, mohon konfirmasi konfigurasi di Router anda sebagai berikut dibawah ini :',
            'configs' => [
                '1' => 'Sudah ada User sebagai penghubung sistem kami dan Router anda<br/>Ada baiknya detail sebagai berikut ini : <br/><code>Username = radiusClient</code><br/><code>Password = radiusABC123#</code><br/>Atau copy paste perintah dibawah ini ke terminal mikrotik anda <br/><code>user add name=radiusClient password=radiusABC123# group=full disabled=no</code>',
                '2' => 'Service API pada router anda dalam keadaan aktif. <span class="text-warning">(kami sarankan untuk merubah port default selain <strong>8728</strong>)</span>.<br/>Untuk memeriksa apakah service API dalam keadaan aktif, silahkan copy paste perintah dibawah ini ke terminal mikrotik anda<br/><code>ip service print where name=api</code><br/>Maka terminal akan menampilkan seperti gambar dibawah ini',
                '3' => 'Router anda memiliki <strong>IP Public</strong> atau bisa menggunakan <strong>VPN</strong>. Jika ingin menggunakan <strong>VPN</strong>, Silahkan hubungi kami untuk dukungan detail <strong>VPN</strong>',
                '4' => 'Konfigurasi Radius sudah disetting di router anda. Adapun konfigurasinya seperti dibawah ini:<br/><code>Address = :Address</code><br/><code>Authentication Port = 1812</code><br/><code>Accounting Port = 1813</code>',
                'finish' => 'Jika semua syarat diatas sudah terpenuhi, maka silahkan klik tombol selanjutnya dibawah ini',
            ]
        ],
        '3' => [
            'menu' => 'Pembuatan Router [NAS]',
            'icon' => 'fas fa-server',
            'message' => 'Setelah Checklist Router [NAS], sebelumnya sudah diperiksa dan dikonfirmasi, maka selanjutnya kita akan membuat Router [NAS] kedalam sistem raduis kami.<br/>Silahkan isikan input dibawah ini sesuai dengan konfigurasi sebelumnya atau sesuai konfigurasi router milik anda'
        ],
        '4' => [
            'menu' => 'Profile Pool',
            'icon' => 'fas fa-poll-h',
            'message' => 'Didalam sistem radius kami, masih membutuhkan konektifitas dengan sistem router anda. Dalam hal ini adalah <strong>IP Pool</strong>. IP Pool yang dipakai adalah IP Pool dari mikrotik anda. Kenapa kami menggunakan <strong>IP Pool</strong> dari mikrotik anda ? Ini sebagai fallback jika terjadi error pada sistem radius kami, jadi jika terdapat error maka sistem akan mencari IP Pool didalam router anda. Selain itu, untuk mengurangi beban pada sistem kami.',
        ],
        '5' => [
            'menu' => 'Profile Bandwidth',
            'icon' => 'fas fa-wifi'
        ],
        '6' => [
            'menu' => 'Layanan',
            'icon' => 'fas fa-concierge-bell',
        ],
        '7' => [
            'menu' => 'Pelanggan',
            'icon' => 'fas fa-user-tie',
        ]
    ],
];
