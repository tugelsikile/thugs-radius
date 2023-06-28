<?php

namespace App\Models\Radius;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


/**
 * @method static where(string $string, mixed $nas_username)
 * @property mixed|string $attribute
 * @property mixed|string $value
 * @property mixed|string $op
 * @property mixed $username
 */
class Radreply extends Model
{
    use HasFactory;
    protected $table = "radreply";
    protected $connection = "radius";
    public $timestamps = false;
}
