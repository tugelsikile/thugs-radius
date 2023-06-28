<?php

namespace App\Models\Radius;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


/**
 * @method static where(string $string, mixed $code)
 * @property mixed|string $op
 * @property mixed|string $attribute
 * @property mixed $groupname
 * @property mixed|string $value
 */
class Radgroupreply extends Model
{
    use HasFactory;
    protected $table = "radgroupreply";
    public $timestamps = false;
    protected $connection = "radius";
}
