<?php

namespace App\Models\Customer;

use App\Models\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @method static where(string $string, mixed $value)
 * @property mixed $services
 * @property mixed $taxes
 * @property mixed $discounts
 * @property mixed $pg_response
 * @property false|mixed|string $pg_transaction
 * @property mixed $order_id
 */
class CustomerInvoice extends Model
{
    use HasFactory, softDeletes;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $connection = "radius";
    protected $casts = [
        'pg_transaction' => 'object',
        'paid_at' => 'datetime',
        'bill_period' => 'datetime',
    ];

    public function customerObj(): BelongsTo
    {
        return $this->setConnection("radius")->belongsTo(Customer::class,'customer','id')->with(['userObj','villageObj','districtObj','cityObj','provinceObj']);
    }
    public function createdBy(): BelongsTo
    {
        return $this->setConnection('mysql')->belongsTo(User::class,'created_by','id');
    }
    public function updatedBy(): BelongsTo
    {
        return $this->setConnection('mysql')->belongsTo(User::class,'updated_by','id');
    }
    public function deletedBy(): BelongsTo
    {
        return $this->setConnection('mysql')->belongsTo(User::class,'deleted_by','id');
    }
    public function paidBy(): BelongsTo
    {
        return $this->setConnection('mysql')->belongsTo(User::class,'paid_by','id');
    }
    public function payments(): HasMany
    {
        return $this->setConnection("radius")->hasMany(CustomerInvoicePayment::class,'invoice','id');
    }
    public function services(): HasMany
    {
        return $this->setConnection("radius")->hasMany(CustomerInvoiceService::class,'invoice','id');
    }
    public function taxes(): HasMany
    {
        return $this->setConnection("radius")->hasMany(CustomerInvoiceTax::class,'invoice','id');
    }
    public function discounts(): HasMany
    {
        return $this->setConnection("radius")->hasMany(CustomerInvoiceDiscount::class,'invoice','id');
    }
}
