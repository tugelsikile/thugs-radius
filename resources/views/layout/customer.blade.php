<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <title>@yield('title')</title>
    <link rel="stylesheet" href="{{asset('theme/plus-admin/assets/vendors/mdi/css/materialdesignicons.min.css')}}">
    <link rel="stylesheet" href="{{asset('theme/plus-admin/assets/vendors/flag-icon-css/css/flag-icon.min.css')}}">
    <link rel="stylesheet" href="{{asset('theme/plus-admin/assets/vendors/css/vendor.bundle.base.css')}}">
    <link rel="stylesheet" href="{{asset('theme/plus-admin/assets/vendors/jquery-bar-rating/css-stars.css')}}" />
    <link rel="stylesheet" href="{{asset('theme/plus-admin/assets/vendors/font-awesome/css/font-awesome.min.css')}}" />
    <link rel="stylesheet" href="{{asset('theme/plus-admin/assets/css/demo_1/style.css')}}" />
    <link rel="shortcut icon" href="{{asset('images/logo-1.png')}}" />
</head>
<body>

<div id="main-container" class="container-scroller">

</div>

<script src="{{asset('theme/plus-admin/assets/vendors/js/vendor.bundle.base.js')}}"></script>
<script src="{{asset('theme/plus-admin/assets/js/off-canvas.js')}}"></script>
<script src="{{asset('theme/plus-admin/assets/js/hoverable-collapse.js')}}"></script>
<script src="{{asset('theme/plus-admin/assets/js/misc.js')}}"></script>
{{--<script src="{{asset('theme/plus-admin/assets/js/settings.js')}}"></script>--}}
{{--<script src="{{asset('theme/plus-admin/assets/js/todolist.js')}}"></script>--}}
{{--<script src="{{asset('theme/plus-admin/assets/js/dashboard.js')}}"></script>--}}

<script src="{{asset('messages.js?t=' . time())}}"></script>
<script>
    let localeLang = localStorage.getItem('locale_lang');
    if (localeLang === null) {
        localeLang = navigator.language.substring(0,2);
        localStorage.setItem('locale_lang', localeLang);
    }
    Lang.setLocale(localeLang);
</script>
@yield('scripts')
</body>
</html>
