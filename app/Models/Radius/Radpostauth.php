<?php

namespace App\Models\Radius;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Radpostauth extends Model
{
    use HasFactory;
    protected $table = "radpostauth";
    protected $connection = "radius";
    public $timestamps = false;
}
