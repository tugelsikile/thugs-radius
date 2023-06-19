@extends('layout.auth')

@section('title', __('configs.labels.menu'))

@section('scripts')
    <script src="{{asset('js/clients/configs/index.js?t=' . time())}}"></script>
@endsection
