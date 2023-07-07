<?php
return [
    'labels' => [
        'menu' => 'Configuration Guide',
        'title' => 'Welcome to first Configuration :Attribute',
    ],
    'steps' => [
        'skip' => 'Skip this step',
        '0' => [
            'menu' => 'Language',
            'icon' => 'fas fa-flag',
            'message' => 'We will guide you to do configuration and introduction to this application<br/>As first step, please select language you will use in this application<br/><small class="text-info"><strong>Note</strong>: You can change the language after anytime</small>',
        ],
        '1' => [
            'menu' => 'Company Profile',
            'icon' => 'fas fa-building',
            'message' => 'Thank you for language selection.<br/>Next, we guide you to complete your company profile. Pleas fill based on input bellow',
        ],
        '2' => [
            'menu' => 'Router [NAS] Requirement',
            'icon' => 'fas fa-server',
            'message' => 'Thank you for completing your company profile.<br/>Lets continue to create a <strong class="text-primary">NAS</strong> or <strong class="text-primary">Router</strong>. Nas can be described as tools or media which connect your customer with our <strong class="text-primary">RADIUS SYSTEM</strong>. In order to run smoothly, please fill confirm your Router configuration as described below :',
            'configs' => [
                '1' => 'User exists as router connection<br/>Your user can be like this : <br/><code>Username = radiusClient</code><br/><code>Password = radiusABC123#</code><br/>Or you can copy and paste this commant to your router terminal <br/><code>user add name=radiusClient password=radiusABC123# group=full disabled=no</code>',
                '2' => 'Your router API Service API is active. <span class="text-warning">(we suggest you to change your default API Port not default <strong>8728</strong>)</span>.<br/>To check if your service is runing or not, please copy and paste command below to your router terminal<br/><code>ip service print where name=api</code><br/>If everything is good, terminal will show you like picture below',
                '3' => 'Your router have <strong>IP Public</strong> or you can use <strong>VPN</strong>. If you want to use <strong>VPN</strong>, Feel free to call us for <strong>VPN</strong> Support detail',
                '4' => 'Radius config already setup on your router. It will be like this below:<br/><code>Address = :Address</code><br/><code>Authentication Port = 1812</code><br/><code>Accounting Port = 1813</code>',
                'finish' => 'If everything is setup, please continue by click this next button below',
            ]
        ],
        '3' => [
            'menu' => 'Router [NAS] Creation',
            'icon' => 'fas fa-server',
            'message' => 'After Router [NAS] Requirement check and confirmed on the previous steps, next we will continue to create a Router to our radius system.<br/>Please fill input below based on your router configuration'
        ],
        '4' => [
            'menu' => 'Pool Profile',
            'icon' => 'fas fa-poll-h',
            'message' => 'In our radius system, we still need connectivity between our system and your router. In this case the <strong>IP Pool</strong>. IP Pool which we will use is IP Pool from your mikrotik. Why we still use the <strong>IP Pool</strong> from your mikrotik? It\'s as a fallback if something goes wrong either in our system and or your router, So if our system crash, you can still get the IP Pool from your router. Besides, it will lower our system consumption :p',
        ],
        '5' => [
            'menu' => 'Bandwidth Profile ',
            'icon' => 'fas fa-wifi',
            'message' => 'As for bandwidth / throughput, we will create it as limitation so as customer not over capacity what your bandwidth got from your ISP.<br/>AS for <em>temporary</em> bandwidth profile, we make it simple as below',
        ],
        '6' => [
            'menu' => 'Service',
            'icon' => 'fas fa-concierge-bell',
            'message' => 'Time to create <strong class="text-primary">Service / Package</strong> for your customer.<br/>In this guide, we will create service for <strong class="text-primary">PPPoE</strong> customer with <strong class="text-success">1 (one) month</strong> <em class="text-primary">time limit</em>  and provide <strong class="text-primary">Router</strong>,<strong class="text-primary">IP Pool</strong>,and <strong class="text-primary">bandwidth limit</strong> we created before.<br/><em class="text-muted"><strong>Note : </strong>You can create hotspot / voucher profile after this wizard</em>',
            'code_info' => 'We keep <strong>PPP User Profile</strong> on your router as fallback described in previous step',
        ],
        '7' => [
            'menu' => 'Customer',
            'icon' => 'fas fa-user-tie',
            'message' => 'Lastly we here. Hold on your horses and keep up ladies and gentlement!! We close to finish yet.<br/>',
        ],
        '8' => [
            'menu' => 'Customer Testing',
            'icon' => 'fas fa-user-check',
            'message' => 'Now we can test what hurdle we encountered on previous step, especially testing customer to our radius system.<br/> For that, make sure you prepared this :',
            'tools' => [
                '1' => 'Access Point for customer',
                '2' => 'Network cable to connect access point to internet',
            ],
            'message_2' => 'After all is ready, please connect and configure the access point as described below <small>(our example is using mikrotik as customer access point)</small>',
            'check' => [
                'button' => 'Check Connection',
                'pending' => 'Checking connection'
            ],
            'success' => [
                'title' => 'Success',
                'message' => 'Congratulation, your customer is successfully connected to our system.'
            ],
            'error' => [
                'title' => 'Failure',
                'message' => 'Too bad, your customer connection is failed. Please check and recheck previous configuration. If problem persist, feel free to call us.',
            ]
        ],
        '9' => [
            'menu' => 'Finish',
            'icon' => 'fas fa-flag-checkered',
            'message' => 'Thank you for passing this configuration guide. Please click Finish button below to finish this configuration guide and back to your dashboard.',
        ]
    ],
    'autofill' => [
        'customer_name' => 'First Customer',
        'username' => 'UserPPPoE',
        'password' => 'PasswordPPPoE'
    ],
    'finish' => 'Finish',
    'errors' => [
        'mikrotik' => [
            'label' => 'user',
            'not_connect' => 'Failed to connect to router',
        ]
    ]
];
