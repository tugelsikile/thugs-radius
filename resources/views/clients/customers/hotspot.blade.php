@extends('layout.auth')

@section('title', __('customers.hotspot.labels.menu'))

@section('scripts')
    <script src="{{asset('js/clients/customers/hotspot.js?t=' . time())}}"></script>
@endsection
