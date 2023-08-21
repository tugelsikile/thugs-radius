<?php

namespace App\Models\Accounting;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @method static orderBy(string $column, string $orderDirection)
 * @method static where(string $column, mixed $value)
 * @property string $id
 * @property string $code
 * @property string $name
 * @property string|null $description
 */
class Account extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $connection = 'radius';
}
