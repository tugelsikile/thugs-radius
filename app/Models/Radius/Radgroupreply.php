<?php

namespace App\Models\Radius;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Radgroupreply extends Model
{
    use HasFactory;
    protected $table = "radgrouprely";
    public $timestamps = false;
    protected $connection = "radius";
}
