<?php

return [
    'confirm' => 'Confirm',
    'cancel' => 'Cancel',
    'method' => 'Undefined method',
    'ok' => 'ok',
    '404' => '404 Page Not Found',
    'required' => 'Must be filled',
    'undefined' => 'Undefined message',
    'save' => 'Save',
    'close' => 'Close',
    'action' => 'Action',
    'no_data' => 'Data Temporarily not available',
    'otp' => 'One Time Payment',
    'menu' => [
        'label' => 'Menu / Functions Lists',
        'info' => [
            'label' => 'Allow users to :type :menu',
            'dont' => 'Restrict users to :type :menu',
        ],
        'name' => [
            'label' => 'Menu Name',
            'info' => 'Menu name based function or usage'
        ],
        'read' => [
            'label' => 'Read',
            'do' => 'read, open and or execute',
            'info' => 'User with selected access allowed to read, open and or execute this actions'
        ],
        'create' => [
            'label' => 'Create',
            'do' => 'creating',
            'info' => 'User with selected access allowed to create this action'
        ],
        'update' => [
            'label' => 'Update',
            'do' => 'updating',
            'info' => 'User with selected access allowed to updating this action',
        ],
        'delete' => [
            'label' => 'Delete',
            'do' => 'deleting',
            'info' => 'User with selected access allowed to deleting this action',
        ]
    ],
    'company' => [
        'labels' => [
            'search' => 'Search Client Radius ...',
            'menu' => 'Client Radius',
            'menu_info' => 'Manage client radius / company',
            'name' => 'Client Radius Name'
        ],
        'create' => [
            'form' => 'Add Client Radius',
            'success' => 'Client Radius successfully added',
            'button' => 'Add',
        ],
        'update' => [
            'form' => 'Update Client Radius',
            'success' => 'Client radius successfully updated',
            'button' => 'Save',
        ],
        'delete' => [
            'form' => 'Delete Client Radius',
            'success' => 'Client radius successfully deleted',
            'button' => 'Delete',
        ],
        'select' => [
            'option' => 'Select Client Radius',
            'label' => 'Client',
            'select' => 'Delete Selected Client',
        ],
        'packages' => [
            'labels' => [
                'menu' => 'Client Radius Package',
                'menu_info' => 'Manage client radius package'
            ],
        ],
        'invoice' => [
            'labels' => [
                'menu' => 'Client Radius Billing',
                'menu_info' => 'Manage Client radius billings',
                'payment' => 'Billing Payment Client Radius',
                'payment_info' => 'Manually paid billings',
            ],
        ],
    ],
    'privileges' => [
        'form_input' => [
            'name' => 'privilege_name',
            'description' => 'privilege_description',
            'client' => 'for_client_radius',
            'company' => 'client_radius_name'
        ],
        'labels' => [
            'info' => 'Privilege Information',
            'search' => 'Search Privilege ...',
            'menu' => 'Privilege',
            'menu_info' => 'Users privileges management',
            'name' => 'Privilege Name',
            'super' => 'Super User',
            'client' => 'For Client Radius',
            'description' => 'Privilege Description',
        ],
        'create' => [
            'form' => 'Add Privilege',
            'success' => 'Privilege successfully added',
            'button' => 'Add',
        ],
        'update' => [
            'form' => 'Update Privilege',
            'success' => 'Privilege successfully updated',
            'button' => 'Save',
        ],
        'delete' => [
            'form' => 'Delete Privilege',
            'success' => 'Privilege successfully deleted',
            'button' => 'Delete',
            'select' => 'Delete Selected Privileges',
        ],
        'set' => [
            'success' => 'Privileges action successfully updated',
            'vis' => 'Show / Hide'
        ],
        'select' => [
            'option' => 'Select Privilege',
            'label' => 'Privilege',
        ]
    ],
    'users' => [
        'form_input' => [
            'level' => 'privilege',
            'company' => 'client_radius_name',
            'name' => 'full_name',
            'email' => 'email_address',
            'password' => 'password',
            'password_confirm' => 'password_confirmation',
            'lang' => 'language',
            'date_format' => 'date_format'
        ],
        'labels' => [
            'sign_out' => 'Sign Out',
            'warning' => [
                'title' => "Be Responsible !!",
                'content' => 'Update and or deleting data with responsibility, because some or and all data is connected one each others'
            ],
            'table_action' => 'Action',
            'signin_text' => 'Login to start a session',
            'signin_button' => 'Login',
            'captcha' => 'Security Code',
            'search' => 'Search Users ...',
            'name' => 'Full Name',
            'email' => 'Email Address',
            'password' => 'Password',
            'password_confirm' => 'Password Confirmation',
            'menu' => 'User',
            'menu_info' => 'Users management',
            'lang' => [
                'label' => 'Language',
                'select' => 'Select Language',
            ],
            'date_format' => [
                'label' => 'Date Format',
                'preview' => 'Preview',
                'select' => 'Select Date Format',
            ],
        ],
        'create' => [
            'form' => 'Add User',
            'success' => 'User successfully added',
            'button' => 'Add',
        ],
        'update' => [
            'form' => 'Update User',
            'password_change' => 'do not fill if you do not want to change the password',
            'success' => 'User successfully updated',
            'button' => 'Save',
        ],
        'delete' => [
            'form' => 'Delete User',
            'success' => 'User successfully deleted',
            'button' => 'Delete',
            'select' => 'Delete Selected User',
            'warning' => 'Selected Users Will Be Deleted'
        ],
        'select' => [
            'option' => 'Select Users',
            'label' => 'Users',
        ]
    ]
];
