@extends('layout.auth')

@section('title', __('messages.privileges.labels.menu'))

@section('scripts')
    <script src="{{asset('js/clients/users/privileges.js?t=' . time())}}"></script>
@endsection
