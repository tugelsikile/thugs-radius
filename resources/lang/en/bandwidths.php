<?php
return [
    'form_input' => [
        'id' => 'bandwidth_profile_data',
        'name' => 'bandwidth_profile_name',
        'description' => 'bandwidth_profile_description',
        'max_limit' => [
            'up' => 'upload_max_limit',
            'down' => 'download_max_limit'
        ],
        'burst' => [
            'up' => 'upload_burst_limit',
            'down' => 'download_burst_limit',
        ],
        'threshold' => [
            'up' => 'upload_burst_threshold',
            'down' => 'download_burst_threshold'
        ],
        'time' => [
            'up' => 'upload_burst_time',
            'down' => 'download_burst_time'
        ],
        'limit_at' => [
            'up' => 'upload_limit_at',
            'down' => 'download_limit_at'
        ],
        'priority' => 'priority',
    ],
    'labels' => [
        'loading' => [
            'pending' => 'Loading Bandwidth Profile data',
            'success' => 'Bandwidth Profile data successfully loaded',
            'error' => 'Failed to load Bandwidth Profile data',
        ],
        'select' => 'Select Bandwidth Profile',
        'menu' => 'Bandwidth Profile',
        'menu_info' => 'Manage bandwidths profiles',
        'name' => 'Bandwidth Profile Name',
        'not_found' => 'Bandwidth Profile Data Not Found',
        'search' => 'Search Bandwidth Profile ...',
        'description' => 'Bandwidth Profile Description',
        'max_limit' => [
            'main' => 'Max Limit',
            'up' => 'Up',
            'up_long' => 'Upload Max Limit ',
            'up_invalid' => 'Upload Max Limit value cannot greater than Upload Burst Limit value',
            'down' => 'Down',
            'down_long' => 'Download Max Limit',
            'down_invalid' => 'Download Max Limit value cannot greater than Download Burst Limit value',
        ],
        'burst_limit' => [
            'main' => 'Burst Limit',
            'up' => 'Up',
            'up_long' => 'Upload Burst Limit',
            'up_invalid' => 'Upload Burst Time value must greater than zero (0) if Upload Burst Limit greater than 0',
            'down' => 'Down',
            'down_long' => 'Download Burst Limit',
            'down_invalid' => 'Download Burst Time value must greater than zero (0) Download Burst Limit greater than 0',
        ],
        'threshold' => [
            'main' => 'Burst Threshold',
            'up' => 'Up',
            'up_long' => 'Upload Burst Threshold',
            'up_invalid' => 'Upload Burst Threshold cannot greater than Upload Burst Limit value',
            'down' => 'Down',
            'down_long' => 'Download Burst Threshold ',
            'down_invalid' => 'Download Burst Threshold cannot greater than Download Burst Limit value',
        ],
        'time' => [
            'main' => 'Burst Time',
            'up' => 'Up',
            'up_long' => 'Upload Burst Time',
            'down' => 'Down',
            'down_long' => 'Download Burst Time'
        ],
        'limit_at' => [
            'main' => 'Limit At',
            'up' => 'Up',
            'up_long' => 'Upload Limit At',
            'up_invalid' => 'Upload Max Limit cannot greater than Upload Limit At value',
            'down' => 'Down',
            'down_long' => 'Download Limit At',
            'down_invalid' => 'Download Max Limit cannot greater than Download Limit At value',
        ],
        'priority' => [
            'name' => 'Priority',
            'select' => 'Select Priority',
            'not_found' => 'Priority Not Found',
        ],
        'queue' => [
            'name' => 'Parent Queue',
            'select' => 'Select Parent Queue',
            'not_found' => 'Parent Queue Not Found',
            'target' => 'Target Address',
        ],
    ],
    'create' => [
        'button' => 'Add Bandwidth',
        'success' => 'Bandwidth Profile successfully added',
    ],
    'update' => [
        'button' => 'Update Bandwidth',
        'success' => 'Bandwidth Profile successfully updated',
    ],
    'delete' => [
        'button' => 'Delete Bandwidth',
        'warning' => 'Warning',
        'select' => 'Delete Selected Bandwidth Profile ?',
        'success' => 'Bandwidth Profile successfully deleted',
    ]
];
