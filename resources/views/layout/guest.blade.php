<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="viewport" content="initial-scale=1, maximum-scale=1">
    <title>@yield('title')</title>
    <meta name="keywords" content="">
    <meta name="description" content="">
    <meta name="author" content="">

    <link rel="stylesheet" type="text/css" href="{{asset('theme/gariox/css/bootstrap.min.css')}}">
    <link rel="stylesheet" type="text/css" href="{{asset('theme/gariox/css/style.css')}}">
    <link rel="stylesheet" href="{{asset('theme/gariox/css/responsive.css')}}">
    <link rel="icon" href="{{asset('images/logo-1.png')}}" type="image/png" />
    <link rel="stylesheet" href="{{asset('theme/gariox/css/jquery.mCustomScrollbar.min.css')}}">
{{--    <link rel="stylesheet" href="https://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css">--}}
    <link href="https://fonts.googleapis.com/css?family=Lato:400,700|Raleway:400,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{asset('theme/gariox/css/owl.carousel.min.css')}}">
    {{--<link rel="stylesheet" href="{{asset('theme/gariox/css/owl.theme.default.min.css')}}">--}}
    {{--<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/fancybox/2.1.5/jquery.fancybox.min.css" media="screen">--}}
</head>
<body>

<div id="welcome-container"></div>

<script src="{{asset('theme/gariox/js/jquery.min.js')}}"></script>
<script src="{{asset('theme/gariox/js/popper.min.js')}}"></script>
<script src="{{asset('theme/gariox/js/bootstrap.bundle.min.js')}}"></script>
<script src="{{asset('theme/gariox/js/jquery-3.0.0.min.js')}}"></script>
<script src="{{asset('theme/gariox/js/plugin.js')}}"></script>
<script src="{{asset('theme/gariox/js/jquery.mCustomScrollbar.concat.min.js')}}"></script>
<script src="{{asset('theme/gariox/js/custom.js')}}"></script>
{{--<script src="{{asset('theme/gariox/js/owl.carousel.js')}}"></script>
<script src="https:cdnjs.cloudflare.com/ajax/libs/fancybox/2.1.5/jquery.fancybox.min.js"></script>--}}
<script>
    $(document).ready(function(){
        $(".fancybox").fancybox({
            openEffect: "none",
            closeEffect: "none"
        });

        $(".zoom").hover(function(){

            $(this).addClass('transition');
        }, function(){

            $(this).removeClass('transition');
        });
    });
</script>
<script>
    function openNav() {
        document.getElementById("myNav").style.width = "100%";
    }
    function closeNav() {
        document.getElementById("myNav").style.width = "0%";
    }
</script>
<script src="{{asset('messages.js?t=' . time())}}"></script>
<script class="destroy-that">
    let apiKey = '{{env('MIX_FIREBASE_API_KEY')}}',
        authDomain = '{{env('MIX_FIREBASE_AUTH_DOMAIN')}}',
        projectId = '{{env('MIX_FIREBASE_PROJECT_ID')}}',
        storageBucket = '{{env('MIX_FIREBASE_STORAGE_BUCKET')}}',
        messagingSenderId = '{{env('MIX_FIREBASE_MESSAGING_SENDER_ID')}}',
        appId = '{{env('MIX_FIREBASE_APP_ID')}}',
        measurementId = '{{env('MIX_FIREBASE_MEASUREMENT_ID')}}';
    if (apiKey.length > 10 &&
        authDomain.length > 10 &&
        projectId.length > 5 &&
        storageBucket.length > 5 &&
        appId.length > 20 &&
        measurementId.length > 5
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
