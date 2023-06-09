@extends('layout.auth')

@section('title', __('profiles.labels.menu'))

@section('scripts')
    <script src="{{asset('js/clients/nas/profiles/index.js?t=' . time())}}"></script>
@endsection
