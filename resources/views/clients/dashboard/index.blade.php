@extends('layout.auth')

@section('title', 'Dashboard')

@section('scripts')
    <script src="{{asset('js/clients/index.js?t=' . time())}}"></script>
@endsection
