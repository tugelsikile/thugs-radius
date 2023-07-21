<?php

namespace App\Models\Company;

use App\Models\Discount;
use App\Models\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property mixed|string $id
 * @property mixed|string $company
 * @property mixed $discount
 * @property mixed $created_by
 */
class CompanyDiscount extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $connection = 'mysql';

    public function discountObj(): BelongsTo
    {
        return $this->belongsTo(Discount::class,'discount','id');
    }
    public function companyObj(): BelongsTo
    {
        return $this->belongsTo(ClientCompany::class,'company','id');
    }
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class,'created_by','id');
    }
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class,'updated_by','id');
    }
}
