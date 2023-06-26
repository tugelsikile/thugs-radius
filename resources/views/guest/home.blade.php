@extends('layout.guest')

@section('title', config('app.name'))

@section('contents')
@endsection

@section('scripts')
    <script src="{{asset('js/guests/welcome.js?t=' . time())}}"></script>
@endsection
