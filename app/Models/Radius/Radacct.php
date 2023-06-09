<?php

namespace App\Models\Radius;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Radacct extends Model
{
    use HasFactory;
    protected $table = "radacct";
    protected $connection = "radius";
    public $timestamps = false;
}
