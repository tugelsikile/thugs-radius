<?php

namespace App\Models\Radius;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Radcheck extends Model
{
    use HasFactory;
    protected $table = "radcheck";
    protected $connection = "radius";
    public $timestamps = false;
}
