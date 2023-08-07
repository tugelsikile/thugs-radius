<?php

namespace App\Models\Accounting;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @method static orderBy(string $column, string $direction)
 * @method static where(string $column, mixed $value)
 * @method static whereIn(string $column, mixed $values)
 * @property mixed|string $id
 * @property mixed|string $code
 */
class CashFlow extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $connection = 'radius';

    protected $casts = [
        'period' => 'datetime',
        'amount' => 'double',
    ];
}
