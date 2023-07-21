<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;
    protected $connection = 'mysql';
    protected $fillable = [
        'code',
        'name',
        'symbols',
        'exchange_rate',
        'prefix',
    ];
    protected $casts = [
        'exchange_rate' => 'double',
        'prefix' => 'boolean',
    ];
}
