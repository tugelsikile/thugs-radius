<?php

namespace App\Models\Customer;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @method static where(string $column, string|mixed|null $value)
 */
class CustomerTraffic extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;

    protected $casts = [
        'input' => 'double',
        'output' => 'double',
    ];
    protected $fillable = [
        'customer', 'input', 'output'
    ];

    public function customerObj(): BelongsTo
    {
        return $this->setConnection('radius')->belongsTo(Customer::class,'customer','id');
    }
}
