@extends('layout.auth')

@section('title', __('taxes.labels.menu'))

@section('scripts')
    <script src="{{asset('js/clients/configs/taxes.js?t=' . time())}}"></script>
@endsection
