<?php
/** @noinspection DuplicatedCode */
return [
    'form_input' => [
        'id' => 'package',
        'name' => 'client_radius_name',
        'address' => 'client_radius_address',
        'email' => 'client_radius_email',
        'postal' => 'postal',
        'phone' => 'phone_or_mobile_number',
        'grand_total' => 'service_grand_total',
        'taxes' => [
            'array_input' => 'taxes',
            'array_delete' => 'delete_taxes',
            'id' => 'tax_data',
            'name' => 'tax_name',
        ],
        'discounts' => [
            'array_input' => 'discount',
            'array_delete' => 'delete_discount',
            'id' => 'discount_data',
            'name' => 'discount_name',
        ]
    ],
    'labels' => [
        'loading' => [
            'pending' => 'Loading client radius data',
            'success' => 'Client radius data successfully loaded',
            'error' => 'Failed to load client radius data',
        ],
        'no_select' => 'Client radius not found',
        'info' => 'Client Radius Information',
        'menu' => 'Client Radius',
        'menu_info' => 'Manage client radius',
        'search' => 'Search Client Radius ...',
        'name' => 'Client Radius Name',
        'code' => 'Client Radius ID',
        'address' => 'Client Radius Address',
        'email' => 'Client Radius Email',
        'postal' => 'Postal',
        'phone' => 'Phone / Mobile Number',
        'select' => 'Select client radius',
        'status' => [
            'active' => 'Active',
            'inactive' => 'InActive',
        ],
        'table_columns' => [
            'code' => 'ID',
            'active' => 'Active Status',
            'name' => 'Client Radius Name',
            'email' => 'Email',
            'expired' => [
                'at' =>  'Expired At',
            ],
        ]
    ],
    'create' => [
        'form' => 'Add Client Radius',
        'success' => 'Successfully added client radius',
        'button' => 'Add',
    ],
    'update' => [
        'form' => 'Update Client Radius',
        'success' => 'Successfully update client radius',
        'button' => 'Save',
    ],
    'delete' => [
        'form' => 'Delete Client Radius',
        'confirm' => "Are your sure want to delete client radius data ?.\nAll connected data will also be deleted",
        'success' => 'Successfully delete data client radius',
        'button' => 'Delete',
        'select' => 'Delete Selected Client Radius'
    ],
    'active' => [
        'confirm' => 'Update Status Active Client Radius',
        'form' => 'Change Status',
        'success' => 'Successfully updating status active client radius',
        'status' => [
            'active' => 'Activate Client Radius',
            'inactive' => 'Inactivate Client Radius',
        ]
    ],
    'packages' => [
        'form_input' => [
            'id' => 'client_radius_package',
            'discount' => 'discount',
            'main_package' => 'main_package',
            'additional' => 'additional_package',
            'additional_deleted' => 'delete_additional_package',
            'name' => 'package_name',
            'otp' => 'one_time_payment',
            'qty' => 'package_qty',
            'description' => 'package_description',
            'price' => 'package_price',
            'vat' => 'tax_percent',
            'duration_type' => 'duration_type',
            'duration_amount' => 'duration_amount',
            'max_user' => 'max_user',
            'max_customer' => 'max_customer',
            'max_voucher' => 'max_voucher',
            'max_router' => 'max_nas_router',
        ],
        'labels' => [
            'loading' => [
                'pending' => 'Loading client radius package data',
                'success' => 'Client radius package data successfully loaded',
                'error' => 'Failed to load client radius package data',
            ],
            'duration_type' => 'Duration Type',
            'duration_type_select' => 'Select Duration Type',
            'description' => 'Package Description',
            'code' => 'Package Code',
            'menu' => 'Client Radius Package',
            'name' => 'Package Name',
            'menu_info' => 'Client Radius Package Management',
            'search' => 'Search Client Radius Package...',
            'add' => 'Add Paket',
            'select' => 'Select client radius package',
            'no_select' => 'No package data',
            'price' => 'Package Price',
            'vat' => 'tax',
            'qty' => 'Quantity',
            'vat_price' => 'Tax Price',
            'sub_total' => 'Subtotal',
            'sub_total_before' => 'Subtotal Before Taxes',
            'sub_total_vat' => 'Subtotal Tax',
            'sub_total_after' => 'Subtotal After Taxes',
            'total' => 'Grand Total',
            'duration' => 'Duration',
            'duration_amount' => 'Duration Amount',
            'discount' => 'Discount / Promo',
            'discount_total' => 'Total Discount / Promo',
            'subtotal_discount' => 'Subtotal After Discount / Promo',
            'grand_total' => 'Grand Total',
            'max_user' => 'Max User',
            'max_customer' => 'Max Customer',
            'max_voucher' => 'Max Voucher',
            'max_router' => 'Max NAS / Router',
            'table_columns' => [
                'code' => 'ID',
                'name' => 'Package Name',
                'price' => 'Price',
                'vat' => 'Tax',
                'duration' => 'Duration',
                'max' => [
                    'main' => 'Max',
                    'user' => 'User',
                    'customer' => 'Customer',
                    'voucher' => 'Voucher',
                    'router' => 'NAS'
                ]
            ],
        ],
        'create' => [
            'form' => 'Add Client Radius Package',
            'success' => 'Successfully adding client radius package',
            'button' => 'Add',
        ],
        'update' => [
            'form' => 'Update Client Radius Package',
            'success' => 'Successfully updating client radius package',
            'button' => 'Save',
        ],
        'delete' => [
            'form' => 'Delete Client Radius Package',
            'confirm' => "Are you sure want to delete client radius package data?.\nAll linked data will also be deleted",
            'success' => 'Successfully deleted client radius package',
            'button' => 'Delete',
            'select' => 'Delete Selected Client Radius Package'
        ],
    ],
    'invoices' => [
        'form_input' => [
            'id' => 'billing_data',
            'name' => 'billing',
            'periode' => 'billing_period',
            'discount' => 'billing_discount',
            'vat' => 'billing_taxes',
            'code' => 'billing_number',
            'grand_total' => 'billing_grand_total',
            'taxes' => [
                'input' => 'taxes',
                'id' => 'taxes_data',
                'name' => 'taxes_name',
                'delete' => 'delete_taxes',
            ],
            'discounts' => [
                'input' => 'discount',
                'id' => 'discount_data',
                'name' => 'discount_name',
                'delete' => 'delete_discount',
            ],
            'package' => [
                'input' => 'package',
                'id' => 'package_data',
                'name' => 'package_name',
                'price' => 'package_price',
                'vat' => 'package_taxes',
                'qty' => 'package_quantity',
                'discount' => 'package_discount',
                'input_delete' => 'delete_package',
            ]
        ],
        'labels' => [
            'loading' => [
                'pending' => 'Loading client radius invoices data',
                'success' => 'Client radius invoices data successfully loaded',
                'error' => 'Failed to load client radius invoices data',
            ],
            'cards' => [
                'total' => 'Billing Total',
                'paid' => 'Billing Paid',
                'unpaid' => 'Pending Billing',
                'tax' => 'Billing Taxes',
                'tax_info' => 'Only billing with paid status will be counted',
            ],
            'print' => 'Print Billing',
            'info' => 'Billing Information',
            'periode' => 'Billing Period',
            'menu' => 'Client Radius Billing',
            'menu_info' => 'Manage client radius billing',
            'select_periode' => 'Select Billing Period',
            'search' => 'Search Billing ...',
            'code' => 'Billing Number',
            'code_generate' => 'Automated Filled ...',
            'vat' => 'Billing Taxes',
            'remaining' => 'Paid Amount Left',
            'status' => 'Billing Status',
            'discount' => 'Billing Discount',
            'subtotal' => [
                'main' => 'Billing Amount',
                'item' => 'Subtotal',
                'tax' => 'Taxes Total',
                'discount' => 'Discounts Total',
            ],
            'package' => [
                'add' => 'Add Package',
                'input' => 'Package',
                'name' => 'Package Name',
                'price' => 'Price',
                'vat' => 'Taxes %',
                'qty' => 'Quantity',
                'discount' => 'Discount',
            ]
        ],
        'generate' => [
            'form' => 'Billing Generate',
            'warning' => 'Warning',
            'message' => 'Continue Billing Generation ?',
            'success' => 'Successfully generating billing',
            'failure' => 'Failed to generate billing because there is currently none to generate',
        ],
        'create' => [
            'form' => 'Add Billing',
            'success' => 'Successfully creating client radius billing',
            'button' => 'Add',
        ],
        'update' => [
            'form' => 'Update Billing',
            'success' => 'Successfully updating client radius billing',
            'button' => 'Save',
        ],
        'delete' => [
            'form' => 'Delete Billing',
            'confirm' => "Are you sure want to delete client radius billing?.\nAll linked data will also be deleted",
            'success' => 'Successfully deleting client radius billing',
            'button' => 'Delete',
            'select' => 'Delete Selected Billing'
        ],
        'payments' => [
            'form_input' => [
                'id' => 'payment',
                'name' => 'payment_name',
                'delete' => 'delete_payment',
                'date' => 'payment_date',
                'note' => 'payment_note',
                'amount' => 'payment_amount',
                'max_amount' => 'paid_maximum',
            ],
            'labels' => [
                'loading' => [
                    'pending' => 'Loading client radius invoices payments data',
                    'success' => 'Client radius invoices payments data successfully loaded',
                    'error' => 'Failed to load client radius invoices payments data',
                ],
                'success' => 'Payment successfully added',
                'error_amount' => 'Payment amount is exceeded billing amount',
                'menu' => 'Billing Payment',
                'menu_info' => 'Manually paid client radius billing',
                'button' => 'Save Payment',
                'add' => 'Add Payment',
                'code' => 'Payment Code',
                'code_temp' => 'Automatically Generated',
                'date' => 'Payment Date',
                'date_select' => 'Select Payment Date',
                'note' => 'Payment Note',
                'by' => 'Paid By',
                'subtotal' => 'Payment Subtotal',
                'amount' => 'Payment Amount',
                'amount_left' => 'Remaining Payment',
                'status' => [
                    'pending' => 'Awaiting Payment',
                    'success' => 'Paid',
                    'partial' => 'Partially Paid',
                ]
            ]
        ]
    ],
    'cps' => [
        'labels' => [
            'name' => 'Contact Person',
            'email' => 'CP. Email',
            'phone' => 'CP. Phone / Mobile'
        ]
    ]
];
