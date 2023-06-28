@extends('layout.login')

@section('title', config('app.name'))

@section('contents')
@endsection

@section('scripts')
    <script src="{{asset('js/guests/forgot-password.js?t=' . time())}}"></script>
@endsection
