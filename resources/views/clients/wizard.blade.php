@extends('layout.auth')

@section('title', __('wizard.labels.menu'))

@section('scripts')
    <script src="{{asset('js/clients/wizard.js?t=' . time())}}"></script>
@endsection
