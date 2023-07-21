<?php

namespace App\Models\Olt;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @method static orderBy(string $column, string $direction)
 * @method static whereIn(string $column, mixed $values)
 * @method static where(string $column, mixed $value)
 * @property mixed|string $id
 * @property mixed $name
 * @property mixed $hostname
 * @property mixed $port
 * @property mixed $community_read
 * @property mixed $community_write
 * @property mixed $created_by
 * @property mixed $user
 * @property mixed $pass
 * @property mixed|object $configs
 * @property mixed|object $brand
 */
class Olt extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $connection = "radius";

    protected $casts = [
        'configs' => 'object',
        'brand' => 'object',
    ];
}
