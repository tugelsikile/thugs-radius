<?php
return [
    'form_input' => [
        'period' => 'period',
        'id' => 'petty_cash_data',
        'name' => 'title',
        'description' => 'description',
        'amount' => 'amount',
        'type' => 'type',
        'approve' => 'need_approval',
    ],
    'labels' => [
        'menu' => 'Petty Cash',
        'menu_info' => 'Petty Cash Management',
        'name' => 'Title',
        'time' => 'Jam',
        'period' => 'Period',
        'input' => 'Income',
        'output' => 'Expenditure',
        'description' => 'Description',
        'amount' => 'Amount',
        'type' => 'Type',
        'balance' => 'Balance',
        'total' => 'Total',
        'approve' => [
            'need' => 'Need Approval',
        ],
        'end_balance' => [
            'label' => 'End Balance',
            'last' => 'Last Month End Balance',
        ]
    ],
    'approve' => [
        'menu' => 'Approve Petty Cash',
        'menu_info' => 'Allow user to approve petty cash data',
        'success' => 'Petty Cash successfully approved',
        'confirm' => [
            'title' => 'Warning',
            'message' => 'Are you sure want to approve this petty cash ?',
            'yes' => 'Approve',
            'no' => 'Cancel',
        ]
    ]
];
