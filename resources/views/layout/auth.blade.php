<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title')</title>
    <link rel="shortcut icon" type="image/png" href="{{asset('favicon.png')}}"/>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">

    {{--<link rel="stylesheet" href="{{asset('theme/adminlte/plugins/fontawesome-free/css/all.min.css')}}">--}}
    <script src="https://kit.fontawesome.com/4678f997d7.js" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="{{asset('theme/adminlte/css/feather.css')}}">
    <link rel="stylesheet" href="https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css">
    <link rel="stylesheet" href="{{asset('css/progress-animation.css')}}">
    <link rel="stylesheet" href="{{asset('theme/adminlte/css/adminlte.min.css')}}">
    <link rel="stylesheet" href="{{asset('theme/adminlte/plugins/overlayScrollbars/css/OverlayScrollbars.min.css')}}">
    @yield('css')
</head>
<body class="hold-transition sidebar-mini layout-fixed text-sm layout-footer-fixed">
<div class="wrapper" id="main-container">

    @yield('contents')

</div>

</div>


<script src="{{asset('theme/adminlte/plugins/jquery/jquery.min.js')}}"></script>
<script src="{{asset('theme/adminlte/plugins/jquery-ui/jquery-ui.min.js')}}"></script>
<script>
    $.widget.bridge('uibutton', $.ui.button)
</script>
<script src="{{asset('theme/adminlte/plugins/bootstrap/js/bootstrap.bundle.min.js')}}"></script>
<script src="{{asset('theme/adminlte/plugins/sparklines/sparkline.js')}}"></script>
<script src="{{asset('theme/adminlte/plugins/jquery-knob/jquery.knob.min.js')}}"></script>
<script src="{{asset('theme/adminlte/plugins/overlayScrollbars/js/jquery.overlayScrollbars.min.js')}}"></script>
<script src="{{asset('theme/adminlte/js/adminlte.js')}}"></script>
<script src="{{asset('messages.js?t=' . time() )}}"></script>

@yield('scripts')
</body>
</html>
