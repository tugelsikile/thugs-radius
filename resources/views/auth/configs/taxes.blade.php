@extends('layout.auth')

@section('title', __('taxes.labels.menu'))

@section('scripts')
    <script src="{{asset('js/auth/configs/taxes.js?t=' . time())}}"></script>
@endsection
