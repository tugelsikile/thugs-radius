<?php

namespace App\Models\Radius;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


/**
 * @method static where(string $string, mixed $code)
 * @property mixed $groupname
 * @property mixed|string $op
 * @property mixed|string $attribute
 * @property int|mixed $value
 */
class Radgroupcheck extends Model
{
    use HasFactory;
    protected $connection = "radius";
    protected $table = "radgroupcheck";
    public $timestamps = false;
}
