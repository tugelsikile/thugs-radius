<?php

namespace App\Models\Customer;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;

    protected $hidden = [
        'nas_username',
        'nas_password',
    ];
}
