@extends('layout.auth')

@section('title', __('timezones.labels.menu'))

@section('scripts')
    <script src="{{asset('js/auth/configs/timezones.js?t=' . time())}}"></script>
@endsection
