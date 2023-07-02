@extends('layout.customer')

@section('title', __('customers.labels.menu'))

@section('scripts')
    <script src="{{asset('js/customers/index.js?t=' . time())}}"></script>
@endsection
