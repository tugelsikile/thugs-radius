@extends('layout.login')

@section('title', config('app.name'))

@section('contents')
@endsection

@section('scripts')
    <script src="{{asset('js/guests/register.js?t=' . time())}}"></script>
@endsection
