@extends('layout.login')

@section('title','Login')

@section('scripts')
    <script src="{{asset('js/login.js?t=') . time()}}"></script>
@endsection
