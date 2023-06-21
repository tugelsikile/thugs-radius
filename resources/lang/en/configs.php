<?php
return [
    'promises' => [
        'pending' => 'Loading configs',
        'success' => 'Configs successfully loaded',
        'error' => 'Failed to load configs',
    ],
    'labels' => [
        'menu' => 'Config',
        'menu_info' => 'Application Config',
    ],
    'site' => [
        'update' => [
            'success' => 'Config successfully saved',
        ],
    ],
    'address' => [
        'form' => 'Name, Logo, and Address Configs',
        'success' => 'Config successfully saved',
        'form_input' => [
            'delete_logo' => 'delete_logo',
            'id' => 'company_data',
            'name' => 'company_name',
            'email' => 'company_email',
            'phone' => 'whatsapp_number',
            'postal' => 'post_code',
            'street' => 'street_name',
            'village' => 'village',
            'district' => 'district',
            'city' => 'city',
            'province' => 'province',
            'logo' => 'company_logo',
        ],
        'name' => 'Company Name',
        'email' => 'Company Email',
        'phone' => 'Whatsapp Number',
        'postal' => 'Postal',
        'street' => 'Street Name',
        'village' => [
            'label' => 'Village',
            'select' => [
                'label' => 'Select Village',
                'no_option' => 'Village Not Found'
            ],
        ],
        'district' => [
            'label' => 'District',
            'select' => [
                'label' => 'Select District',
                'no_option' => 'District Not Found'
            ],
        ],
        'city' => [
            'label' => 'City',
            'select' => [
                'label' => 'Select City',
                'no_option' => 'City Not Found'
            ],
        ],
        'province' => [
            'label' => 'Province',
            'select' => [
                'label' => 'Select Province',
                'no_option' => 'Province Not Found'
            ],
        ],
        'logo' => [
            'label' => 'Company Logo',
            'change' => 'Change company logo',
            'select' => 'Select company logo',
            'max' => 'File logo size maximum is 5 Mb, your file size is :size',
            'min' => 'File logo size minimal is 10 Kb, your file size is :size',
            'error' => "Error while loading file.\nRepeat loading a logo again",
            'delete' => 'Delete Company Logo',
            'limitation' => "File must be an images, file size maximum 5 Mb no less than 10 Kb with 200 pixel x 200 pixel minimum, and 500 pixel x 500 pixel maximum with a same width and height",
            'dimension' => 'Image dimension is not match, current dimension is :width x :height',
            'width' => [
                'max' => 'Width dimension of company logo is maximum 700 pixel, you file width is :size',
                'min' => 'Width dimension of company logo is minimum 200 pixel, you file width is :size'
            ],
            'height' => [
                'max' => 'Height dimension of company logo is maximum 700 pixel, you file width is :size',
                'min' => 'Height dimension of company logo is maximum 200 pixel, you file width is :size'
            ]
        ],
        'submit' => 'Save'
    ]
];
