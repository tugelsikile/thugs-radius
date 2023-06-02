@extends('layout.auth')

@section('title', __('companies.invoices.labels.menu'))

@section('scripts')
    <script src="{{asset('js/auth/companies/invoices.js?t=' . time())}}"></script>
@endsection
