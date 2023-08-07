<?php

namespace App\Models\Accounting;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @method static orderBy(string $column, string $orderDir)
 * @method static where(string $column, mixed $value)
 * @property mixed|string $id
 * @property mixed|string $code
 */
class Category extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $connection = 'radius';
}
