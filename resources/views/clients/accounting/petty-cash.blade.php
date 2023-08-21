@extends('layout.auth')

@section('title', __('petty_cash.labels.menu'))

@section('scripts')
    <script src="{{asset('js/clients/accounting/petty-cash.js?t=' . time())}}"></script>
@endsection
