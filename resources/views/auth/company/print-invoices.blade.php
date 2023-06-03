@extends('layout.auth')

@section('title', __('companies.invoices.labels.menu'))

@section('scripts')
    <script src="{{asset('js/auth/companies/print-invoices.js?t=' . time())}}" data-id="{{$id}}"></script>
@endsection
