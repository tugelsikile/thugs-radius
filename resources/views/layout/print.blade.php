<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title')</title>
    <link rel="shortcut icon" type="image/png" href="{{asset('images/logo-1.png')}}"/>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
    <script src="https://kit.fontawesome.com/4678f997d7.js" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="{{asset('css/print.css')}}">
    @yield('css')
</head>
<body class="hold-transition sidebar-mini layout-fixed text-sm layout-footer-fixed">

@yield('contents')

@yield('scripts')
</body>
</html>
