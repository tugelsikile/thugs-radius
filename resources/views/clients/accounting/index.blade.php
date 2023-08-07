@extends('layout.auth')

@section('title', __('accounting.labels.menu'))

@section('scripts')
    <script src="{{asset('js/clients/accounting/index.js?t=' . time())}}"></script>
@endsection
