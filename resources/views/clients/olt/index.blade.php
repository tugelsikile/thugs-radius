@extends('layout.auth')

@section('title', __('olt.labels.menu'))

@section('scripts')
    <script src="{{asset('js/clients/olt/index.js?t=' . time())}}"></script>
@endsection
