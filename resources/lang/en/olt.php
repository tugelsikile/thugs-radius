<?php
return [
    'form_input' => [
        'id' => 'olt_data',
        'name' => 'olt_name',
        'host' => 'hostname',
        'port' => 'port',
        'read' => 'read_community',
        'write' => 'write_community',
        'user' => 'username',
        'pass' => 'password',
        'onu' => 'onu_data',
        'phase_state' => 'phase_state',
        'customer' => 'customer_data',
        'brand' => 'olt_brand',
        'model' => 'olt_model',
        'prompts' => [
            'user' => 'username_prompt',
            'pass' => 'password_prompt',
        ],
        'onus' => [
            'type' => 'onu_type',
            'brand' => 'modem_brand',
            'current' => 'olt_onu_port',
            'olt' => 'olt_port',
            'index' => 'onu_index',
            'name' => 'gpon_name',
            'description' => 'gpon_description',
            'sn' => 'serial_number',
            'tcont' => [
                'input' => 'tcont',
                'id' => 'tcont_id',
                'profile' => 'tcont_profile',
            ],
            'gemport' => [
                'input' => 'gemport',
                'id' => 'gemport_id',
                'downstream' => 'downstream',
                'upstream' => 'upstream',
            ],
            'vlan' => [
                'input' => 'vlan',
                'port' => 'vlan_port',
                'vport' => 'vlan_vport',
                'user' => 'vlan_user',
                'service' => 'vlan_service',
            ],
            'pon_mng' => [
                'input' => 'pon_management',
                'name' => 'pon_management_name',
                'vlan' => 'pon_management_vlan'
            ]
        ]
    ],
    'labels' => [
        'menu' => 'OLT',
        'menu_info' => 'OLT Management',
        'form_info' => 'Currently, we use <em class="text-primary">telnet</em> as communication tools between <em class="text-info">sistem</em> and <em class="text-danger">olt</em>, so please input form as <em class="text-primary">telnet</em> configuration',
        'name' => 'OLT Name',
        'host' => 'Hostname',
        'port' => 'Port',
        'detail' => 'Manage OLT',
        'uptime' => 'Uptime',
        'username' => 'Username',
        'password' => 'Password',
        'brand' => 'OLT Brand',
        'model' => 'OLT Model',
        'onu' => [
            'brand' => 'Modem Brand',
            'index' => 'Onu Index',
            'name' => 'Onu Name',
            'description' => 'Onu Description',
            'type' => 'Onu Type',
            'sn' => 'Serial Number',
            'distance' => 'ONU Dist.',
            'duration' => 'Online Duration',
            'un_configure' => [
                'menu' => 'Delete GPon Configuration',
                'info' => 'Delete selected GPon configuration (warning)',
            ],
        ],
        'pon_mng' => [
            'vlan' => 'Pon Management VLan'
        ],
        'customers' => [
            'link' => 'Link to Customer',
            'unlink' => 'Delete Customer Link',
            'link_unlink' => [
                'menu' => 'Connect and or Disconnect GPon to customer',
                'info' => 'Ability to connect and or disconnect Gpon to customer (not configure)',
            ]
        ],
        'loss' => 'LOS',
        'community' => [
            'label' => 'Community',
            'read' => 'Read Community',
            'write' => 'Write Community',
        ],
        'prompts' => [
            'info' => 'Used when try to login to olt, Zte usually use <strong><em>U</em>sername</strong> with Uppercase <strong>U</strong>',
            'user' => 'Username Prompt',
            'pass' => 'Password Prompt'
        ],
        'preview' => 'OLT Telnet Command Preview',
    ],
    'un_configure' => [
        'button' => 'Unlink Customer and Unconfigure',
        'confirm' => [
            'title' => 'Warning',
            'message' => "Unlink customer and delete olt configuration\nCustomer data will not deleted, only olt configuration will deleted.\nContinue Unlink Customer and Unconfigure ?",
            'yes' => 'Confirm and Proceed',
            'cancel' => 'Cancel',
        ],
    ],
    'configure' => [
        'button' => 'GPon Registration',
        'title' => 'GPon Registration Form',
        'pending' => 'Saving Config',
        'submit' => 'Save Config',
        'success' => 'Gpon Successfully registered',
    ],
    'cards' => [
        'ports' => [
            'count' => 'Port Count',
            'used' => 'Used Port',
            'available' => 'Available Port',
        ]
    ]
];
