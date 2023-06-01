@extends('layout.auth')

@section('title', __('messages.company.labels.menu'))

@section('scripts')
    <script src="{{asset('js/auth/companies/index.js?t=' . time())}}"></script>
@endsection
