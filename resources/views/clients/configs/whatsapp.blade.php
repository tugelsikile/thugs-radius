@extends('layout.auth')

@section('title', __('whatsapp.labels.menu'))

@section('scripts')
    <script src="{{asset('js/clients/configs/whatsapp.js?t=' . time())}}"></script>
@endsection
