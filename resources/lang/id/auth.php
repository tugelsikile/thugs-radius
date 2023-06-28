<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Baris-baris bahasa untuk autentifikasi
    |--------------------------------------------------------------------------
    |
    | Baris bahasa berikut digunakan selama proses autentifikasi untuk beberapa
    | pesan yang perlu kita tampilkan ke pengguna. Anda bebas untuk memodifikasi
    | baris bahasa sesuai dengan keperluan aplikasi anda.
    |
    */

    'failed'   => 'Identitas tersebut tidak cocok dengan data kami.',
    'password' => 'Kata sandi yang dimasukan tidak valid.',
    'throttle' => 'Terlalu banyak usaha masuk. Silahkan coba lagi dalam :seconds detik.',
    'form_input' => [
        'email' => 'alamat_email',
        'password' => 'kata_sandi',
        'confirm' => 'kata_sandi_confirmation',
        'captcha' => 'kode_keamanan',
        'avatar' => 'gambar_profile',
    ],
    'labels' => [
        'email' => 'Alamat Email',
        'password' => 'Kata Sandi',
        'confirm' => 'Konfirmasi Kata Sandi',
        'captcha' => 'Kode Keamanan',
    ],
    'has_account' => 'Sudah punya akun, saya ingin masuk',
    'forgot_password' => [
        'label' => 'Lupa kata sandi',
        'message' => 'Reset Kata Sandi',
        'submit' => 'Kirim Permintaan',
    ],
    'register_new_member' => [
        'label' => 'Pendaftaran Akun Baru',
        'submit' => 'Daftar',
        'success' => "Pendaftaran berhasil dikirim !!\nMohon periksa email anda untuk melanjutkan ke tahap berikutnya."
    ],
    'social' => [
        'try' => 'Mencoba untuk :SignType menggunakan :Social<br/>Mohon untuk menunggu ...',
        'success' => "Sukses :SignType menggunakan :Social\nMenunggu mengalihkan halaman ...",
        'sign_up' => [
            'label' => 'Daftar',
            'doing' => 'mendaftar',
            'button' => 'Daftar menggunakan :Social',
            'fail' => 'Gagal mendaftar menggunakan :Social',
            'success' => 'Berhasil mendaftar menggunakan :Social',
        ],
        'sign_in' => [
            'label' => 'Masuk',
            'doing' => 'masuk',
            'button' => 'Masuk menggunakan :Social',
        ],
        'google' => [
            'label' => 'Akun Google',
        ],
    ],
];
