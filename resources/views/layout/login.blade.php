<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title')</title>
    <link rel="shortcut icon" type="image/png" href="{{asset('favicon.png')}}"/>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
    <link rel="stylesheet" href="{{asset('theme/adminlte/plugins/fontawesome-free/css/all.min.css')}}">
    <link rel="stylesheet" href="https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css">
    <link rel="stylesheet" href="{{asset('theme/adminlte/plugins/icheck-bootstrap/icheck-bootstrap.min.css')}}">
    <link rel="stylesheet" href="{{asset('theme/adminlte/css/adminlte.min.css')}}">
    <link rel="stylesheet" href="{{asset('css/captcha.css')}}">
</head>
<body class="hold-transition login-page text-sm">
<div class="login-box" id="login-box">
    @yield('contents')
</div>

<script src="{{asset('theme/adminlte/plugins/jquery/jquery.min.js')}}"></script>
<script src="{{asset('theme/adminlte/plugins/bootstrap/js/bootstrap.bundle.min.js')}}"></script>
<script src="{{asset('theme/adminlte/js/adminlte.min.js')}}"></script>
<script src="{{asset('messages.js?t=' . time() )}}"></script>
<script>
    Lang.setLocale('id');
</script>
@yield('scripts')
</body>
</html>
