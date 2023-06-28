<?php
return [
    'form_input' => [
        'id' => 'user_data',
        'name' => 'user_name',
        'email' => 'user_email',
        'password' => [
            'current' => 'password',
            'confirm' => 'password_confirmation'
        ],
        'lang' => 'language',
        'date_format' => 'date_format'
    ],
    'labels' => [
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
            'current' => 'Password',
            'confirm' => 'Confirm Password'
        ]
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
