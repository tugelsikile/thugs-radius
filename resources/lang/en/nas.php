<?php
return [
    'form_input' => [
        'id' => 'router_data',
        'name' => 'router_name',
        'description' => 'router_description',
        'type' => 'router_type',
        'method' => 'connection_type',
        'ip' => 'connection_router_ip',
        'domain' => 'connection_router_domain',
        'port' => 'connection_router_port',
        'user' => 'connection_router_user',
        'pass' => 'connection_router_password',
        'pass_confirm' => 'connection_router_password_confirmation',
        'expire_url' => 'expired_url',
    ],
    'labels' => [
        'menu' => 'Router [NAS]',
        'menu_info' => 'Router [NAS] Management',
        'not_found' => 'Router Not Found',
        'search' => 'Search Router ...',
        'select' => 'Select Router [NAS]',
        'name' => 'Router Name',
        'description' => 'Router Description',
        'type' => 'Router Type',
        'method' => [
            'header' => 'Connection',
            'label' => 'Connection Type',
            'short' => 'Conn. Type'
        ],
        'domain' => [
            'label' => 'Router Domain',
            'short' => 'Domain',
            'info' => 'Make sure your router already installed domain and valid ssl, click <a href="" target="_blank">here</a> for more info ',
        ],
        'ip' => [
            'label' => 'Connection Router IP',
            'short' => 'IP'
        ],
        'port' => [
            'label' => 'Connection Router Port',
            'short' => 'Port',
        ],
        'user' => [
            'label' => 'Connection Router User',
            'short' => 'User'
        ],
        'pass' => [
            'label' => 'Connection Router Password',
            'short' => 'Password',
            'confirm' => 'Router Password Confirmation',
        ],
        'status' => [
            'label' => 'Connection Status',
            'short' => 'Status',
        ],
        'expire_url' => 'Expired URL',
        'check_connection' => 'Check Connection',
        'connection' => [
            'type' => [
                'api' => 'API Connection',
                'ssl' => 'SSL Connection (https)',
            ],
            'failed' => 'Could not connect to router',
            'success' => 'Successfully connected to ',
        ]
    ],
    'create' => [
        'limited' => 'Router Count exceeded maximal router allowed in your service, Upgrade your service to continue',
        'form' => 'Add Router Form',
        'btn' => 'Add Router',
        'button' => 'Add and Save',
        'success' => 'Router successfully added',
    ],
    'update' => [
        'form' => 'Update Router Form',
        'btn' => 'Update Router',
        'button' => 'Save Changes',
        'success' => 'Router successfully updated',
    ],
    'delete' => [
        'warning' => 'Warning',
        'btn' => 'Delete Router',
        'select' => 'Delete Selected Router',
        'success' => 'Router successfully deleted',
    ],
    'select' => [
        'labels' => [
            'menu' => 'Select Router [NAS]',
            'menu_info' => 'Connect and manage your router'
        ],
    ],
    'pools' => [
        'form_input' => [
            'id' => 'ip_pool_data',
            'name' => 'ip_pool_name',
            'description' => 'ip_pool_description',
            'upload' => 'upload_to_router',
            'address' => [
                'first' => 'first_ip',
                'last' => 'last_ip',
            ]
        ],
        'labels' => [
            'menu' => 'Profile IP Pool',
            'menu_info' => 'Manage profile IP pool',
            'not_found' => 'IP Pool Not Found !!',
            'search' => 'Search Pool ...',
            'name' => 'IP Pool Name',
            'description' => 'IP Pool Description',
            'address' => [
                'first' => 'First IP',
                'last' => 'Last IP',
                'error' => 'Last IP :ip block number :index (:block) is not less than first ip :ip2 block number :index2 (:block2)'
            ],
            'upload' => [
                'true' => 'Upload IP Pool to router [NAS]',
                'false' => 'Don\'t upload IP Pool to router [NAS]'
            ],
            'invalid_name' => 'IP Pool cannot contain white space'
        ],
        'create' => [
            'form' => 'Add IP Pool Form',
            'button' => 'Add IP Pool',
            'success' => 'IP Pool successfully added',
        ],
        'update' => [
            'form' => 'Update IP Pool Form',
            'button' => 'Update IP Pool',
            'success' => 'IP Pool successfully updated',
        ],
        'delete' => [
            'button' => 'Delete IP Pool',
            'select' => 'Delete Selected Pool',
        ]
    ],
];
