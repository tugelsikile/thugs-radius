@extends('layout.auth')

@section('title', __('backup.labels.menu'))

@section('scripts')
    <script src="{{asset('js/clients/backup/backup.js?t=' . time())}}"></script>
@endsection
