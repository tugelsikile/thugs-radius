@extends('layout.auth')

@section('title', __('bandwidths.labels.menu'))

@section('scripts')
    <script src="{{asset('js/clients/nas/profiles/bandwidths.js?t=' . time())}}"></script>
@endsection
