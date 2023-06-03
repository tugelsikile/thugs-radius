@extends('layout.auth')

@section('title', __('currencies.labels.menu'))

@section('scripts')
    <script src="{{asset('js/auth/configs/currencies.js?t=' . time())}}"></script>
@endsection
