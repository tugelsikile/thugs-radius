<?php

namespace App\Models\Menu;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @method static where(string $column, mixed $value)
 * @method static whereNotIn(string $column, array $value)
 * @property string $id
 */
class Menu extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;

    protected $casts = [
        'function' => 'boolean',
        'for_client' => 'boolean'
    ];
}
