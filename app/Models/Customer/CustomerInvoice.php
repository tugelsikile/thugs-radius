<?php

namespace App\Models\Customer;

use App\Models\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerInvoice extends Model
{
    use HasFactory, softDeletes;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $connection = "radius";
    protected $casts = [
        'bill_period' => 'date'
    ];

    public function customerObj(): BelongsTo
    {
        return $this->belongsTo(Customer::class,'customer','id')->with(['userObj','villageObj','districtObj','cityObj','provinceObj']);
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
}
