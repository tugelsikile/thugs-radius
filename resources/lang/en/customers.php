<?php
return [
    'form_input' => [
        'id' => 'customer_data',
        'type' => 'customer_type',
        'name' => 'customer_name',
        'address' => [
            'street' => 'street',
            'village' => 'village',
            'district' => 'district',
            'city' => 'city',
            'province' => 'province',
            'postal' => 'postal_code',
            'phone' => 'whatsapp_number',
        ],
        'username' => 'user_name',
        'password' => 'password',
        'email' => 'email_address',
        'service' => [
            'input' => 'additional_service',
            'id' => 'additional_service_data',
            'name' => 'additional_service_name',
            'delete' => 'delete_additional_service',
        ],
        'taxes' => [
            'input' => 'tax',
            'id' => 'tax_data',
            'name' => 'tax_name',
            'delete' => 'delete_tax',
        ],
        'discounts' => [
            'input' => 'discount',
            'id' => 'discount_data',
            'name' => 'discount_name',
            'delete' => 'delete_discount',
        ]
    ],
    'labels' => [
        'select' => [
            'label' => 'Select customers',
            'not_found' => 'Customer not found',
        ],
        'menu' => 'Customers',
        'menu_info' => 'Customers management',
        'loading' => [
            'pending' => 'Loading customers',
            'success' => 'Customers successfully loaded',
            'error' => 'Failed to load customers',
        ],
        'search' => 'Search Customer ...',
        'type' => 'Customer Type',
        'type_short' => 'Type',
        'no_type' => 'Customer not found',
        'name' => 'Customer Name',
        'not_found' => 'Customer not found',
        'code' => 'Cust. ID',
        'status' => [
            'label' => 'Status',
            'active' => 'Active',
            'activate' => 'Activate',
            'message_activate' => "Activate Customers ?\nActive customer will be counted and can connected to network",
            'inactive' => 'InActive',
            'inactivate' => 'Inactivate',
            'message_inactivate' => "Inactivate Customers ?\nInactive customer wont be connected to network.\nRunning bill wont be deleted",
            'register' => 'Registered',
            'warning' => 'Warning',
            'success' => 'Customer Active Status successfully updated',
            'expired' => 'Expired',
            'generated' => 'Generated',
            'used' => 'Used',
            'select' => [
                'label' => 'Select Status',
                'not_found' => 'Status Not Found',
            ]
        ],
        'service' => [
            'tab' => 'Additional Service',
            'grand_total' => [
                'label' => 'Grand Total',
            ],
            'select' => [
                'label' => 'Select Additional Service',
                'not_found' => 'Additional Service Not Found',
            ],
            'taxes' => [
                'label' => 'Tax Service',
                'add' => 'Add Tax',
                'subtotal' => 'Tax Total',
                'select' => [
                    'label' => 'Select Tax',
                    'not_found' => 'Tax Not Found',
                ]
            ],
            'discount' => [
                'label' => 'Discount',
                'add' => 'Add Discount',
                'subtotal' => 'Total Discount',
                'select' => [
                    'label' => 'Select Discount',
                    'not_found' => 'Discount Not Found',
                ],
            ],
            'name' => 'Service Name',
            'type' => 'Type',
            'main' => 'Main',
            'add' => 'Additional',
            'price' => 'Price',
            'not_found' => 'Additional Service Not Found',
            'add_btn' => 'Add Additional Service',
            'subtotal' => [
                'label' => 'Subtotal',
            ]
        ],
        'address' => [
            'tab' => 'Address',
            'street' => 'Street',
            'postal' => 'Postal',
            'email' => 'Email Address',
            'phone' => 'Whatsapp Numb.',
            'call' => 'Send Whatsapp Message',
        ],
        'username' => [
            'label' => 'User Name',
            'errors' => [
                'whitespace' => 'White space or space not allowed for User Name Column',
            ]
        ],
        'password' => [
            'label' => 'Password',
            'whitespace' => 'White space or space not allowed for Password Column',
        ],
        'due' => [
            'at' => 'Expired Date',
        ]
    ],
    'create' => [
        'button' => 'Add Customer',
        'form' => 'Customer Add Form',
        'success' => 'Customer successfully added'
    ],
    'update' => [
        'button' => 'Update Customer',
        'form' => 'Customer Update Form',
        'success' => 'Customer successfully updated',
    ],
    'delete' => [
        'button' => 'Delete Customer',
        'warning' => 'Warning !',
        'select' => "Delete Selected Customer ?",
        'success' => 'Customer Successfully deleted'
    ],
    'pppoe' => [
        'labels' => [
            'menu' => 'PPPoE Customers',
            'menu_info' => 'PPPoE customer management',
        ]
    ],
    'hotspot' => [
        'form_input' => [
            'username' => 'user_name',
            'password' => 'password',
        ],
        'labels' => [
            'menu' => 'Hotspot Customers',
            'menu_info' => 'Hotspot customers management',
            'status' => [
                'generated' => 'GENERATED',
                'used' => 'USED'
            ]
        ],
        'generate' => [
            'success' => 'Hotspot voucher successfully generated',
            'progress' => [
                'title' => 'Start Hotspot Voucher Generate',
                'warning' => 'Dont close / refresh this page until success',
                'span' => 'Processing :current of :total voucher (:percent) Finish',
            ],
            'separator' => [
                'label' => 'Separator',
                'every' => 'Separate Every'
            ],
            'qty' => 'Voucher Quantity',
            'max' => 'Max Generate Voucher is 5000',
            'length_max' => ':parent cant no more than :length',
            'preview' => 'Preview User Name and Password',
            'usernames' => [
                'label' => 'User Name',
                'format' => 'User Name Format',
                'random' => 'Random User Name Length',
                'length' => 'Nama User Length',
                'invalid_length' => 'User Name Length Format is more than Random User Name Length',
                'length_max' => 'Max User Name Length is :length characters',
                'type' => 'User Name Type',
                'preview' => 'User Name Preview',
                'prefix' => [
                    'true' => 'Random As User Name Suffix',
                    'false' => 'Random As User Name Prefix'
                ]
            ],
            'passwords' => [
                'label' => 'Password',
                'format' => 'Password Format',
                'random' => 'Random Password Length',
                'length' => 'Password Length',
                'invalid_length' => 'Password Format Length exceeded Random Password Length',
                'length_max' => 'Max Password Length is :length characters',
                'type' => 'Password Type',
                'preview' => 'Password Preview',
                'prefix' => [
                    'true' => 'Random As Password Suffix',
                    'false' => 'Random As Password Prefix'
                ]
            ],
            'types' => [
                'none' => 'Dont Use Format',
                'alnum' => 'Alpha Numeric (Upper and Lower)',
                'alnum-lower' => 'Lower Alpha Numeric',
                'alnum-upper' => 'Upper Alpha Numeric',
                'alpha' => 'Alpha (Upper and Lower)',
                'alpha-lower' => 'Lower Alpha',
                'alpha-upper' => 'Upper Alpha',
                'numeric' => 'Numeric'
            ],
            'button' => 'Generate Voucher Hotspot',
            'form' => 'Form Generate Voucher Hotspot',
            'submit' => 'Generate Now',
        ],
        'vouchers' => [
            'batch' => 'Batch',
            'menu' => 'Hotspot Voucher',
            'delete' => 'Delete Voucher',
            'update' => 'Update Voucher'
        ]
    ],
    'invoices' => [
        'labels' => [
            'menu' => 'Customers Billing',
            'menu_info' => 'Manage customers billing',
        ],
        'payments' => [
            'labels' => [
                'menu' => 'Customers Billings Payment',
                'menu_info' => 'Manually paid customers billing',
            ]
        ],
    ]
];
