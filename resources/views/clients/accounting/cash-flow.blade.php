@extends('layout.auth')

@section('title', __('cash_flow.labels.menu'))

@section('scripts')
    <script src="{{asset('js/clients/accounting/cash-flow.js?t=' . time())}}"></script>
@endsection
