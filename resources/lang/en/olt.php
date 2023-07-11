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
    ],
    'labels' => [
        'menu' => 'OLT (experimental)',
        'menu_info' => 'OLT Management (experimental)',
        'name' => 'OLT Name',
        'host' => 'Hostname',
        'port' => 'Port',
        'detail' => 'Manage OLT',
        'uptime' => 'Uptime',
        'community' => [
            'label' => 'Community',
            'read' => 'Read Community',
            'write' => 'Write Community',
        ]
    ]
];
