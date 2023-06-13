<?php

namespace App\Models\Radius;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Radusergroup extends Model
{
    use HasFactory;
    public $incrementing = false;
    protected $keyType = "string";
    public $timestamps = false;
    protected $table = "radusergroup";
    protected $connection = "radius";
}
