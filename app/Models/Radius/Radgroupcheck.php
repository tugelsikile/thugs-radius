<?php

namespace App\Models\Radius;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Radgroupcheck extends Model
{
    use HasFactory;
    protected $connection = "radius";
    protected $table = "radgroupcheck";
    public $timestamps = false;
}
