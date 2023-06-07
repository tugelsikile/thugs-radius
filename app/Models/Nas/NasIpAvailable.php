<?php

namespace App\Models\Nas;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NasIpAvailable extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;
}
