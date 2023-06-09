<?php

namespace App\Models\Radius;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Radreply extends Model
{
    use HasFactory;
    protected $table = "radreply";
    protected $connection = "radius";
    public $timestamps = false;
}
