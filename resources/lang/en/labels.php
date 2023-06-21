<?php
return [
    'form_input' => [
        'keywords' => 'keyword',
        'search_type' => 'search_type',
    ],
    'type' => ':Attribute Type',
    'additional' => [
        'true' => 'Additional :Attribute Tambahan',
        'false' => 'Main :Attribute',
    ],
    'search' => 'Search :Attribute ...',
    'not_found' => ':Attribute momentarily not available',
    'select' => [
        'option' => 'Select :Attribute',
        'not_found' => ':Attribute not found',
    ],
    'create' => [
        'label' => 'Add :Attribute',
        'form' => 'Add :Attribute Form',
        'submit' => 'Save and Add :Attribute',
        'success' => ':Attribute successfully added and saved',
        'pending' => 'Adding :Attribute ...',
    ],
    'update' => [
        'label' => 'Update :Attribute',
        'form' => 'Update :Attribute Form',
        'submit' => 'Save Change :Attribute',
        'success' => ':Attribute successfully updated',
        'pending' => 'Saving :Attribute ...',
    ],
    'delete' => [
        'label' => 'Delete :Attribute',
        'confirm' => [
            'title' => 'Warning',
            'message' => 'Are you sure want to delete :Attribute ?',
            'confirm' => 'Delete',
            'cancel' => 'Cancel',
        ],
        'select' => 'Delete Selected :Attribute',
        'success' => ':Attribute successfully deleted'
    ],
    'generate' => [
        'label' => 'Generate :Attribute',
        'form' => 'Generate :Attribute Form',
        'message' => "You will generate :Attribute.\nContinue generate :Attribute ?",
        'submit' => 'Generate :Attribute',
        'success' => ':Attribute successfully generated',
        'pending' => 'Generating :Attribute ...',
    ],
    'active' => [
        'success' => 'Active Status of :Attribute successfully updated',
        'button' => 'Activate :Attribute',
        'confirm' => [
            'title' => 'Activate :Attribute',
            'message' => "Active status selected :Attribute will changed to active.\nAre you sure want to activate selected :Attribute ?",
            'confirm' => 'Activate',
            'cancel' => 'Cancel'
        ]
    ],
    'inactive' => [
        'success' => 'Inactive status of :Attribute successfully changed',
        'button' => 'Inactivate :Attribute',
        'confirm' => [
            'title' => 'Inactivate :Attribute',
            'message' => "Active Status of selected :Attribute will changed into inactive.\nAre you sure want to inactivate selected :Attribute ?",
            'confirm' => 'Inactivate',
            'cancel' => 'Cancel'
        ]
    ],
    'confirm' => [
        'message' => "Are you sure want to do this action ?",
        'title' => 'Warning',
        'yes' => 'Confirm',
        'cancel' => 'Cancel',
    ],
    'total' => ':Attribute Total',
    'online' => 'Online :Attribute',
    'offline' => 'Offline :Attribute',
    'max' => ':Attribute Maximum',
    'min' => ':Attribute Minimum'
];
