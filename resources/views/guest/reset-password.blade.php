@extends('layout.login')

@section('title', config('app.name'))

@section('contents')
@endsection

@section('scripts')
    <script data-id="{{$token}}" src="{{asset('js/guests/reset-password.js?t=' . time())}}"></script>
@endsection
