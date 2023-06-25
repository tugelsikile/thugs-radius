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
@yield('scripts')
</body>
</html>
