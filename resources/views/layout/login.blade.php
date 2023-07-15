<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title')</title>
    <link rel="shortcut icon" type="image/png" href="{{asset('images/logo-1.png')}}"/>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
    <link rel="stylesheet" href="{{asset('theme/adminlte/plugins/fontawesome-free/css/all.min.css')}}">
    <link rel="stylesheet" href="https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css">
    <link rel="stylesheet" href="{{asset('theme/adminlte/plugins/icheck-bootstrap/icheck-bootstrap.min.css')}}">
    <link rel="stylesheet" href="{{asset('theme/adminlte/css/adminlte.min.css')}}">
    <link rel="stylesheet" href="{{asset('css/captcha.css')}}">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/lipis/flag-icons@6.6.6/css/flag-icons.min.css" />
    <style>
        .box-show {
            opacity: 1;
            display: block;
            transition: opacity 5s ease-in, display 5s ease-in;
        }
        .box-hidden {
            opacity: 0;
            display: none;
            transition: opacity 5s ease-in, display 5s ease-in;
        }
    </style>
</head>
<body class="hold-transition login-page text-sm">
<div id="login-box">
    @yield('contents')
</div>


<script src="{{asset('theme/adminlte/plugins/jquery/jquery.min.js')}}"></script>
<script src="{{asset('theme/adminlte/plugins/bootstrap/js/bootstrap.bundle.min.js')}}"></script>
<script src="{{asset('theme/adminlte/js/adminlte.min.js')}}"></script>
<script src="{{asset('messages.js?t=' . time() )}}"></script>
<script class="destroy-this" src="{{asset('js/plugins/crypto-js/crypto-js.js')}}"></script>
<script class="destroy-that">
    let apiKey = '{{env('MIX_FIREBASE_API_KEY')}}',
        authDomain = '{{env('MIX_FIREBASE_AUTH_DOMAIN')}}',
        projectId = '{{env('MIX_FIREBASE_PROJECT_ID')}}',
        storageBucket = '{{env('MIX_FIREBASE_STORAGE_BUCKET')}}',
        messagingSenderId = '{{env('MIX_FIREBASE_MESSAGING_SENDER_ID')}}',
        appId = '{{env('MIX_FIREBASE_APP_ID')}}',
        measurementId = '{{env('MIX_FIREBASE_MEASUREMENT_ID')}}';
    if (apiKey.length > 0 &&
        authDomain.length > 0 &&
        projectId.length > 0 &&
        storageBucket.length > 0 &&
        appId.length > 0 &&
        measurementId.length > 0
    ) {
        localCrypt = {
            apiKey: apiKey,
            authDomain: authDomain,
            projectId: projectId,
            storageBucket: storageBucket,
            messagingSenderId: messagingSenderId,
            appId: appId,
            measurementId: measurementId
        }
        const encrypt = CryptoJS.AES.encrypt(JSON.stringify(localCrypt), window.location.hostname).toString();
        localStorage.setItem('fireCrypt', encrypt);
        //const decrypt = CryptoJS.AES.decrypt(encrypt, window.location.hostname);
        //console.log(encrypt, JSON.parse(decrypt.toString(CryptoJS.enc.Utf8)));
    }
</script>
<script>
    const elem = document.getElementsByClassName('destroy-this');
    const that = document.getElementsByClassName('destroy-that');
    if (that !== null && that.length > 0) that[0].parentNode.removeChild(that[0]);
    if (elem !== null && elem.length > 0) elem[0].parentNode.removeChild(elem[0]);

    let localeLang = localStorage.getItem('locale_lang');
    if (localeLang === null) {
        localeLang = navigator.language;
        if (localeLang === null) localeLang = 'id';
        if (localeLang.length > 2) localeLang = localeLang.substr(0,2);
        localStorage.setItem('locale_lang', localeLang);
    }
    Lang.setLocale(localeLang);
</script>

@yield('scripts')
</body>
</html>
