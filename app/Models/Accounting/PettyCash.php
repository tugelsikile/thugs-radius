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
 * @method static whereMonth(string $column, string $month)
 * @method static whereYear(string $column, string $year)
 * @property string $id
 * @property mixed|string $period
 * @property mixed|string $name
 * @property mixed|string $description
 * @property mixed|string $type
 * @property double|mixed $amount
 * @property mixed|string $approved_at
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
