@extends('layout.auth')

@section('title', __('nas.labels.menu'))

@section('scripts')
    <script src="{{asset('js/clients/nas/index.js?t=' . time())}}"></script>
@endsection
