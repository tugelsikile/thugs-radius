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
        'prompts' => [
            'user' => 'username_prompt',
            'pass' => 'password_prompt',
        ]
    ],
    'labels' => [
        'menu' => 'OLT (experimental)',
        'menu_info' => 'OLT Management (experimental)',
        'form_info' => 'Currently, we use <em class="text-primary">telnet</em> as communication tools between <em class="text-info">sistem</em> and <em class="text-danger">olt</em>, so please input form as <em class="text-primary">telnet</em> configuration',
        'name' => 'OLT Name',
        'host' => 'Hostname',
        'port' => 'Port',
        'detail' => 'Manage OLT',
        'uptime' => 'Uptime',
        'username' => 'Username',
        'password' => 'Password',
        'onu' => [
            'index' => 'Onu Index',
            'description' => 'Onu Description',
        ],
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
    ]
];
