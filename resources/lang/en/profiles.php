<?php
return [
    'form_input' => [
        'id' => 'service_data',
        'name' => 'service_name',
        'type' => 'service_type',
        'is_additional' => 'additional_service',
        'code' => 'mikrotik_profile_name',
        'queue' => [
            'name' => 'parent_queue',
            'id' => 'queue_id',
            'target' => 'target'
        ],
        'description' => 'service_description',
        'price' => 'service_price',
        'limitation' => [
            'type' => 'limitation_type',
            'rate' => 'limitation_amount',
            'unit' => 'limitation_unit',
        ],
        'address' => [
            'local' => 'local_address',
            'dns' => 'dns_servers'
        ]
    ],
    'labels' => [
        'loading' => [
            'pending' => 'Loading services',
            'success' => 'Services successfully loaded',
            'error' => 'Failed loading services',
        ],
        'menu' => 'Services',
        'menu_info' => 'Manage services',
        'code' => [
            'label' => 'Mikrotik :Attribute Profile Name',
            'info' => 'This will saved as Mikrotik Profile :Attribute Name in mikrotik router',
            'error' => 'Mikrotik Profile :Attribute Name not allowed white space'
        ],
        'not_found' => 'No services found',
        'select' => 'Select Services',
        'search' => 'Search Services ...',
        'name' => 'Service Name',
        'short_name' => 'Service',
        'name_invalid' => 'No Allowed space or white space on Service name',
        'price' => 'Service Price',
        'type' => 'Service Type',
        'description' => 'Service Description',
        'additional' => [
            'name' => 'Additional Service ?',
            'info_true' => 'This is additional service',
            'info_false' => 'This is not an additional service',
        ],
        'validity' => [
            'rate' => 'Service Duration',
            'unit' => 'Service Duration Unit',
        ],
        'service_type' => 'Service Type',
        'limitation' => [
            'name' => 'Limitation',
            'type' => 'Limitation Type',
            'select' => 'Select Service Type',
            'value' => 'Limitation Amount',
        ],
        'address' => [
            'local' => 'Local Address',
            'dns' => 'DNS Servers',
            'add_dns' => 'Add DNS Server',
            'remove_dns' => 'Delete DNS Server',
        ],
        'customers' => [
            'length' => 'Customers Count',
        ]
    ],
    'create' => [
        'button' => 'Add Services',
        'form' => 'Formulir Tambah Layanan',
        'success' => 'Services successfully added',
    ],
    'update' => [
        'button' => 'Ubah Layanan',
        'form' => 'Formulir Rubah Layanan',
        'success' => 'Services successfully saved',
    ],
    'delete' => [
        'button' => 'Hapus Layanan',
        'success' => 'Services successfully deleted',
        'warning' => 'Warning',
        'select' => "Selected services will be deleted.\nContinue delete selected services ?"
    ]
];
