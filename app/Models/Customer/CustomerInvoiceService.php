<?php

namespace App\Models\Customer;

use App\Models\Nas\NasProfile;
use App\Models\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerInvoiceService extends Model
{
    use HasFactory, softDeletes;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $connection = "radius";

    public function invoiceObj(): BelongsTo
    {
        return $this->belongsTo(CustomerInvoice::class,'invoice','id');
    }
    public function serviceObj(): BelongsTo
    {
        return $this->belongsTo(NasProfile::class,'service','id');
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
}
