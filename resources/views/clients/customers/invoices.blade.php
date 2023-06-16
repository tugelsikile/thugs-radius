@extends('layout.auth')

@section('title', __('customers.invoices.labels.menu'))

@section('scripts')
    <script src="{{asset('js/clients/customers/invoices.js?t=' . time())}}"></script>
@endsection
