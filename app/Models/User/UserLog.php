<?php

namespace App\Models\User;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserLog extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    protected $connection = "mysql";
    public $incrementing = false;

    protected $casts = [
        'params' => 'object'
    ];
}
