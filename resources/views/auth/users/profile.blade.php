@extends('layout.auth')

@section('title', $user == null ? 'Profile' : 'Profile ' . ucwords(strtolower($user->name)))
@section('scripts')
    <script data-value="{{$user->id}}" src="{{asset('js/auth/users/profile.js?t=' . time())}}"></script>
@endsection
