<?php

namespace App\Models\User;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property mixed|string $id
 * @property mixed $user
 * @property mixed|string $url
 * @property mixed|string $method
 * @property array|mixed $params
 * @property mixed|string|null $ip
 * @property mixed|string $browser
 * @property mixed $platform
 */
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
