@extends('layout.auth')

@section('title', 'Dashboard')

@section('scripts')
    <script src="{{asset('js/auth/index.js?t=' . time())}}"></script>
@endsection
