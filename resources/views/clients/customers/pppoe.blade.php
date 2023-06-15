@extends('layout.auth')

@section('title', __('customers.pppoe.labels.menu'))

@section('scripts')
    <script src="{{asset('js/clients/customers/pppoe.js?t=' . time())}}"></script>
@endsection
