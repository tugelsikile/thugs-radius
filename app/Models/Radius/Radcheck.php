<?php

namespace App\Models\Radius;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @method static where(string $string, mixed $nas_username)
 * @property mixed|string $attribute
 * @property mixed|string $op
 * @property mixed $username
 */
class Radcheck extends Model
{
    use HasFactory;
    protected $table = "radcheck";
    protected $connection = "radius";
    public $timestamps = false;
}
