@extends('layout.auth')

@section('title', __('gateways.labels.menu'))

@section('scripts')
    <script src="{{asset('js/clients/configs/payment-gateways.js?t=' . time())}}"></script>
@endsection
