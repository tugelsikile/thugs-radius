@extends('layout.auth')

@section('title', __('discounts.labels.menu'))

@section('scripts')
    <script src="{{asset('js/auth/configs/discounts.js?t=' . time())}}"></script>
@endsection
