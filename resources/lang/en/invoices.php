<?php
return [
    'form_input' => [
        'id' => 'bill_data',
        'bill_period' => 'bill_period',
        'total' => 'total_bill',
        'note' => 'bill_note',
        'service' => [
            'input' => 'bill_service',
            'id' => 'bill_service_data',
            'delete' => 'delete_bill_service',
        ],
        'taxes' => [
            'input' => 'bill_taxes',
            'id' => 'bill_taxes_data',
            'delete' => 'delete_bill_taxes_data',
        ],
        'discounts' => [
            'input' => 'bill_discount',
            'id' => 'bill_discount_data',
            'delete' => 'bill_discount_delete',
        ],
    ],
    'labels' => [
        'loading' => [
            'pending' => 'Loading bill for bill period :bill_period',
            'success' => 'Bill Period :bill_period Successfully loaded ',
            'error' => 'Failed to load Bill Period :bill_period'
        ],
        'sorts' => [
            'code' => 'Sort by bill ID :dir',
            'id' => 'Sort By Order ID :dir',
            'name' => 'Sort By Customer Name :dir',
            'amount' => 'Sort By Bill Amount :dir',
            'paid' => 'Sort By Payment Amount :dir',
            'status' => 'Sort By Bill Status :dir',
        ],
        'service' => [
            'add' => 'Add Service',
            'delete' => 'Delete Service',
            'select' => [
                'label' => 'Select Service',
                'not_found' => 'Not Service',
            ],
            'total' => [
                'sub' => 'Subtotal',
            ],
        ],
        'taxes' => [
            'add' => 'Add Taxes',
            'delete' => 'Delete Taxes',
            'select' => [
                'label' => 'Select Taxes',
                'not_found' => 'Taxes Not Found',
            ],
            'percent' => 'Taxes % ',
            'value' => 'Tax Amount',
            'total' => [
                'sub' => 'Taxes Total',
                'label' => 'Bill Taxes',
            ]
        ],
        'discounts' => [
            'add' => 'Add Discount',
            'delete' => 'Delete Discount',
            'select' => [
                'label' => 'Select Discount',
                'not_found' => 'Discount Not Found',
            ],
            'amount' => 'Discount Amount',
            'total' => [
                'sub' => 'Discount Total',
                'label' => 'Bill Discount'
            ]
        ],
        'will_generate' => 'Will Generated',
        'search' => 'Cari Bill ...',
        'not_found' => 'Bill Not found',
        'note' => 'Bill Note',
        'bill_period' => [
            'label' => 'Bill Period',
            'select' => 'Select Bill Period',
            'current' => ':Attribute Bill',
            'last' => 'Last Month Bill',
        ],
        'code' => 'Bill No.',
        'order_id' => 'Order ID',
        'amount' => [
            'label' => 'Bill Amount',
        ],
        'paid' => [
            'label' => 'Paid Amount',
            'date' => [
                'select' => 'Select Paid Date',
            ]
        ],
        'status' => [
            'label' => 'Bill Status',
            'select' => [
                'label' => 'Select Bill Status',
                'not_found' => 'Bill Status Not Found',
            ]
        ],
        'cards' => [
            'total' => 'Bill Total',
            'paid' => 'Paid Total',
            'pending' => 'Paid Left',
            'tax' => 'Tax',
        ],
    ],
    'generate' => [
        'button' => 'Generate Bill',
        'form' => 'Bill Generate Form',
        'submit' => 'Start Generate',
        'success' => 'Bill successfully generated',
        'info' => [
            'title' => "Warning !!",
            'text' => "Bill Generation criteria :",
            'criteria' => [
                '1' => 'Customer is active',
                '2' => 'Active Status of customer before bill period <em>Refer input <b>Bill Period</b></em>',
                '3' => 'Bill amount not zero <em>(0)</em> after tax and discounts',
                '4' => 'No active bill',
                '5' => 'Manually create if not above criteria',
            ]
        ]
    ],
    'info' => [
        'button' => 'Bill Information',
        'submit' => '',
        'form' => 'Bill Information'
    ],
    'create' => [
        'button' => 'Create Bill',
        'success' => 'Bill successfully created',
        'submit' => 'Save and Create Bill',
        'form' => 'Create Bill Form',
    ],
    'update' => [
        'button' => 'Update Bill',
        'success' => 'Bill successfully updated',
        'submit' => 'Save Changes',
        'form' => 'Update Bill Form',
    ],
    'delete' => [
        'warning' => 'Warning',
        'button' => 'Delete Bill',
        'select' => 'Delete Selected Bill',
        'success' => 'Bill successfully deleted',
    ],
    'payments' => [
        'success' => 'Bill payment successfully saved',
        'button' => 'Manual Payment',
        'add' => 'Add Payment',
        'form' => 'Manual Bill Payment Form',
        'submit' => 'Save Payment',
        'name' => 'Bill Payment',
        'date' => [
            'label' => 'Date',
            'select' => 'Select Payment Date',
        ],
        'note' => [
            'label' => 'Note',
            'input' => 'Fill payment note'
        ],
        'amount' => [
            'label' => 'Amount',
            'input' => 'Fill payment amount',
            'total' => 'Payment Total',
            'left' => 'Payment Left',
        ],
        'by' => 'Oleh',
        'form_input' => [
            'id' => 'bill_data',
            'payment' => [
                'input' => 'payment',
                'id' => 'payment_data',
                'note' => 'payment_note',
                'date' => 'payment_date',
                'amount' => 'payment_amount',
                'delete' => 'payment_delete',
            ],
            'total' => [
                'payment' => 'payment_total',
                'invoice' => 'bill_total',
            ],
        ],
    ]
];
