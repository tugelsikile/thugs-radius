@extends('layout.auth')

@section('title', __('messages.users.labels.menu'))

@section('scripts')
    <script src="{{asset('js/clients/users/index.js?t=' . time())}}"></script>
@endsection
