<?php
return [
    'form_input' => [
        'avatar' => 'profile_picture',
        'id' => 'user_data',
        'name' => 'user_name',
        'email' => 'user_email',
        'require_nas' => 'nas_required',
        'nas' => [
            'input' => 'nas_input',
            'id' => 'nas_data',
            'name' => 'nas_name',
            'delete' => 'nas_delete',
        ],
        'password' => [
            'old' => 'old_password',
            'current' => 'password',
            'confirm' => 'password_confirmation'
        ],
        'lang' => 'language',
        'date_format' => 'date_format',
        'time_zone' => 'time_zone',
    ],
    'labels' => [
        'account' => [
            'label' => 'Account',
            'success' => 'Account successfully updated'
        ],
        'menu' => 'Users',
        'menu_info' => 'Manage users',
        'name' => 'User Name',
        'email' => 'User Email',
        'search' => 'Search User ...',
        'last' => [
            'login' => 'Last Login',
            'activity' => 'Last Activity',
        ],
        'select' => [
            'not_found' => 'User Not Found',
            'label' => 'Select User'
        ],
        'password' => [
            'old' => 'Old Password',
            'current' => 'Password',
            'confirm' => 'Confirm Password'
        ],
        'profile' => ':User Profile',
        'avatar' => [
            'label' => 'Profile picture file',
            'width' => 'Profile picture file width',
            'height' => 'Profile picture file height',
            'success' => 'Profile picture successfully updated',
        ],
        'locale' => [
            'lang' => 'Language',
            'label' => 'Locale',
            'date_time' => 'Date Format',
            'time_zone' => 'Time Zone',
        ],
    ],
    'create' => [
        'button' => 'Create User',
        'form' => 'User Create Form',
        'submit' => 'Save and Create User',
        'success' => 'User successfully created',
    ],
    'update' => [
        'button' => 'Update User',
        'form' => 'User Update Form',
        'submit' => 'Save Change',
        'success' => 'User successfully updated',
        'error_admin' => "You not allowed to update user ADMIN",
    ],
    'delete' => [
        'button' => 'Delete User',
        'success' => 'User successfully deleted',
        'select' => 'Delete Selected User',
        'confirm' => "Are your sure want to delete selected users ?",
        'error_user' => "You not allowed to delete all users."
    ],
    'privileges' => [
        'form_input' => [
            'name' => 'user_privilege',
        ],
        'labels' => [
            'menu' => 'Privileges',
            'menu_info' => 'Manage privileges',
            'select' => [
                'not_found' => 'No User Privilege',
                'label' => 'Select User Privilege',
                'no_select' => 'Select User Privilege First',
                'no_menu' => 'No Options',
            ],
        ],
        'create' => [
            'info' => 'Create Privilege'
        ],
        'update' => [
            'button' => 'Update Privilege',
        ],
        'delete' => [
            'button' => 'Delete Privilege',
        ]
    ],
    'resets' => [
        'labels' => [
            'menu' => 'Manually reset user password',
            'menu_info' => 'Allowed to manually reset user password',
            'button' => 'Reset Password',
            'confirm' => "Are you sure want to reset current user password ?."
        ]
    ]
];
