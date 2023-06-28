<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Authentication Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines are used during authentication for various
    | messages that we need to display to the user. You are free to modify
    | these language lines according to your application's requirements.
    |
    */

    'failed' => 'These credentials do not match our records.',
    'password' => 'The provided password is incorrect.',
    'throttle' => 'Too many login attempts. Please try again in :seconds seconds.',
    'form_input' => [
        'email' => 'email_address',
        'password' => 'password',
        'confirm' => 'password_confirmation',
        'captcha' => 'security_code',
        'avatar' => 'profile_picture',
    ],
    'labels' => [
        'email' => 'Email Address',
        'password' => 'Password',
        'confirm' => 'Password Confirmation',
        'captcha' => 'Security Code',
    ],
    'has_account' => 'Already have an account, i want to sign in',
    'forgot_password' => [
        'label' => 'I forgot my password',
        'message' => 'Reset Password',
        'submit' => 'Submit Request',
    ],
    'register_new_member' => [
        'label' => 'Registration new membership',
        'submit' => 'Register',
        'success' => "Registration successfully Submitted !!\nCheck your email for the next registration step."
    ],
    'social' => [
        'try' => 'Trying to :SignType using :Social<br/>Please wait ...',
        'success' => ":SignType using :Social Successfully\nPlease wait while redirecting ...",
        'sign_up' => [
            'label' => 'Sign up',
            'doing' => 'signing up',
            'button' => 'Sign up using :Social',
            'fail' => 'Failed to sign up using :Social',
            'success' => 'Successfully signing up using :Social',
        ],
        'sign_in' => [
            'label' => 'Sign in',
            'doing' => 'signing in',
            'button' => 'Sign in using :Social'
        ],
        'google' => [
            'label' => 'Google Account',
        ],
    ],
];
