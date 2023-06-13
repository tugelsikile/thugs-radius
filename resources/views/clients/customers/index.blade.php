@extends('layout.auth')

@section('title', __('customers.labels.menu'))

@section('scripts')
    <script src="{{asset('js/clients/customers/index.js?t=' . time())}}"></script>
@endsection
