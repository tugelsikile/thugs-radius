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
        'callback' => 'callback_url',
        'return' => 'return_url',
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
        'va' => 'V.A. Number',
        'copy_va' => 'Copy Virtual Account Number',
        'va_copied' => 'Virtual Account Number successfully copied to your clipboard',
        'grand_total' => 'Grand Total',
        'reference_code' => 'Reference Code',
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
            'callback' => [
                'label' => 'Callback URL',
                'copy' => 'Copy Callback URL',
                'copied' => 'Callback URL successfully copied to your clipboard',
                'info' => 'Copy this callback URL into your duitku.com project on <strong class="text-primary">"Callback Url Project"</strong> column<br/>This Callback URL is important for your customer validation if they paid using their prefered channel payment',
            ],
            'return' => 'Return URL',
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
            'status' => [
                'process' => 'Waiting Payment',
                'success' => 'Successfully Paid'
            ]
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
