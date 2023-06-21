<?php
return [
    'form_input' => [
        'id' => 'payment_gateway_data',
        'name' => 'payment_gateway_name',
        'description' => 'payment_gateway_description',
        'production_mode' => 'production_mode',
        'url' => 'merchant_url',
        'website' => 'website_url',
        'module' => 'module_name',
        'duitku' => [
            'merchant_code' => 'merchant_code',
            'api_key' => 'api_key',
        ],
        'briapi' => [
            'consumer_key' => 'consumer_key',
            'consumer_secret' => 'consumer_secret'
        ]
    ],
    'labels' => [
        'menu' => 'Payment Gateway',
        'menu_info' => 'Management payment gateway for online payment',
        'name' => 'Payment Gateways Name',
        'module' => 'Module',
        'status' => 'Status',
        'description' => 'Description',
        'mode' => [
            'label' => 'Mode',
            'production' => 'Production Mode',
            'sandbox' => 'Sandbox Mode',
        ],
        'url' => [
            'label' => 'Module URL',
            'website' => 'Website',
            'production' => 'Production URL',
            'sandbox' => 'Sandbox URL',
        ]
    ],
    'promises' => [
        'pending' => 'Loading payment gateway data',
        'success' => 'Payment gateway successfully loaded',
        'error' => 'Failed to load payment gateway data'
    ],
    'module' => [
        'name' => 'Module Name',
        'duitku' => [
            'label' => 'Duitku.com',
            'merchant_code' => 'Merchant Code',
            'api_key' => 'API Key',
        ],
        'briapi' => [
            'label' => 'BRI API',
            'consumer_key' => 'Consumer Key',
            'consumer_secret' => 'Consumer Secret',
        ],
    ],
    'activate' => [
        'menu' => 'Activate Payment Gateway',
        'menu_info' => 'Activating payment gateway for online payment',
    ]
];
