<?php

namespace App\Models\Company\Invoice;

use App\Models\Company\ClientCompany;
use App\Models\Discount;
use App\Models\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyInvoiceDiscount extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $connection = 'mysql';

    protected $casts = [
        'amount' => 'double'
    ];
    public function discountObj(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Discount::class,'discount','id');
    }
    public function companyObj(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ClientCompany::class,'company','id');
    }
    public function createdBy(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class,'created_by','id');
    }
    public function updatedBy(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class,'updated_by','id');
    }
}
