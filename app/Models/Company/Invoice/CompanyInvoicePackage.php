<?php

namespace App\Models\Company\Invoice;

use App\Models\Company\CompanyPackage;
use App\Models\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CompanyInvoicePackage extends Model
{
    use HasFactory, softDeletes;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $connection = 'mysql';

    protected $casts = [
        'price' => 'double',
        'vat' => 'double',
        'discount' => 'double',
    ];
    public function packageObj(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(CompanyPackage::class,'package','id');
    }
    public function invoiceObj(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(CompanyInvoice::class,'invoice','id');
    }
    public function createdBy(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class,'created_by','id');
    }
    public function updatedBy(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class,'updated_by','id');
    }
    public function deletedBy(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class,'deleted_by','id');
    }
}
