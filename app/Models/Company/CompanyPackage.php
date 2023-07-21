<?php

namespace App\Models\Company;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property mixed|string $id
 * @method static where(string $string, mixed|string $value)
 */
class CompanyPackage extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $connection = 'mysql';

    protected $casts = [
        'base_price' => 'double',
        'vat_percent' => 'double',
        'is_additional' => 'boolean',
    ];
}
