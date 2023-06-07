@extends('layout.auth')

@section('title', __('nas.pools.labels.menu'))

@section('scripts')
    <script src="{{asset('js/clients/nas/profiles/pools.js?t=' . time())}}"></script>
@endsection
