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
        ],
        'midtrans' => [
            'merchant_id' => 'merchant_id',
            'server_key' => 'server_key',
            'client_key' => 'client_key',
            'urls' => [
                'notification' => 'notification_url',
                'recurring' => 'recurring_url',
                'account' => 'account_url',
                'finish' => 'finish_url',
                'unfinished' => 'unfinished_url',
                'error' => 'error_url',
            ]
        ],
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
        'paid_before' => 'Expire Code',
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
            'label' => 'Duitku',
            'merchant_code' => 'Merchant Code',
            'api_key' => 'API Key',
            'status' => [
                'process' => 'Waiting Payment',
                'success' => 'Successfully Paid',
                'expired' => 'Expired Payment Code'
            ],
            'info_callback_url' => 'Copy this callback URL into your duitku.com project on <strong class="text-primary">"Callback Url Project"</strong> column<br/>This Callback URL is important for your customer validation if they paid using their preferred channel payment',
        ],
        'briapi' => [
            'label' => 'BRI API',
            'consumer_key' => 'Consumer Key',
            'consumer_secret' => 'Consumer Secret',
        ],
        'midtrans' => [
            'label' => 'Midtrans',
            'merchant_id' => 'Merchant ID',
            'server_key' => 'Server Key',
            'client_key' => 'Client Key',
            'status' => [
                'pending' => 'Waiting Payment',
                'capture' => 'Payment Captured',
                'settlement' => 'Successfully Paid',
                'deny' => 'Denied Payment',
                'cancel' => 'Canceled Payment',
                'expire' => 'Expired Payment Code',
                'failure' => 'Failure Payment',
                'refund' => 'Refund Payment',
                'chargeback' => 'Charge Back Payment',
                'partial_refund' => 'Partially Refund Payment',
                'partial_chargeback' => 'Partially Charge Back Payment',
                'authorize' => 'Authorized Payment',
            ],
            'urls' => [
                'copy' => 'Copy :Attribute',
                'copied' => ':Attribute successfully copied',
                'notification' => [
                    'label' => 'Notification Url',
                    'info' => 'Notification Url from customer when payment occurs',
                ],
                'recurring' => [
                    'label' => 'Recurring Url',
                    'info' => 'Recurring Url when customer recurring payment occurs',
                ],
                'account' => [
                    'label' => 'Pay Account Url',
                    'info' => 'Pay Account Url when pay account status exists from customer payment',
                ],
                'finish' => [
                    'label' => 'Finish Redirect Url',
                    'info' => 'Redirect Url when payment is finished',
                ],
                'unfinished' => [
                    'label' => 'Unfinished Redirect Url',
                    'info' => 'Url redirect when payment is unfinished',
                ],
                'error' => [
                    'label' => 'Error Redirect Url',
                    'info' => 'Url redirect when payment is error',
                ]
            ],
            'info_callback_url' => 'Copy these URLs into your Midtrans Dashboad on <strong class="text-primary">"Settings -> Configuration"</strong><br/>This URLs is important for your customer validation if they paid using their preferred channel payment',
        ],
    ],
    'activate' => [
        'menu' => 'Activate Payment Gateway',
        'menu_info' => 'Activating payment gateway for online payment',
    ],
    'cstore' => [
        'code' => 'Payment Code',
    ]
];
