<?php

namespace App\Models\Olt;

use App\Models\Customer\Customer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @method static where(string $column, string $value)
 * @property mixed|string $id
 * @property mixed $customer
 * @property mixed $state
 * @property mixed $onu_index
 */
class CustomerPhaseState extends Model
{
    use HasFactory;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $connection = 'radius';

    protected $fillable = [
        'state', 'onu_index'
    ];

    public function customerObj(): BelongsTo
    {
        return $this->setConnection('radius')->belongsTo(Customer::class,'customer','id');
    }
}
