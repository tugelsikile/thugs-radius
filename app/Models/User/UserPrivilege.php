<?php

namespace App\Models\User;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @method static where(string $string, mixed|string $value)
 * @property bool $read
 * @property bool $create
 * @property bool $update
 * @property bool $delete
 * @property string $id
 * @property string $level
 * @property string $route
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
