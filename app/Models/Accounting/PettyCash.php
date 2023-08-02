<?php

namespace App\Models\Accounting;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @method static whereDate(string $column, string $value)
 * @method static orderBy(string $column, string $value)
 * @method static where(string $column, string $value)
 * @method static whereIn(string $column, array $values)
 * @property string $id
 */
class PettyCash extends Model
{
    use HasFactory, softDeletes;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $connection = 'radius';

    protected $casts = [
        'amount' => 'double',
        'period' => 'datetime',
        'has_approval' => 'boolean',
        'remarks' => 'object',
    ];
}
