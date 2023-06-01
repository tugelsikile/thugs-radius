@extends('layout.auth')

@section('title', __('companies.packages.labels.menu'))

@section('scripts')
    <script src="{{asset('js/auth/companies/packages.js?t=' . time())}}"></script>
@endsection
