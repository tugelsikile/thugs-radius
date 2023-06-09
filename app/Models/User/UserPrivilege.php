<?php

namespace App\Models\User;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @method static where(string $string, mixed|string $value)
 */
class UserPrivilege extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;

    protected $casts = [
        'read' => 'boolean',
        'create' => 'boolean',
        'update' => 'boolean',
        'delete' => 'boolean',
    ];
}
