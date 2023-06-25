@extends('layout.guest')

@section('title', config('app.name'))

@section('contents')
@endsection

@section('scripts')
    <script>
        let lang = 'id';
        if (localStorage.getItem('locale_lang') !== null) {
            lang = localStorage.getItem('locale_lang');
        }
        Lang.setLocale(lang);
    </script>
    <script src="{{asset('js/guests/welcome.js?t=' . time())}}"></script>
@endsection
