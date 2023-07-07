<?php

namespace App\Models\Company;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property mixed|string $id
 * @property mixed|string $company
 * @property mixed $package
 * @property mixed $paid_every_type
 * @property mixed $paid_every_ammount
 * @property mixed $qty
 * @property bool|mixed $otp
 */
class AdditionalPackage extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $connection = 'mysql';

    protected $casts = [
        'otp' => 'double',
    ];
    public function companyObj(): BelongsTo
    {
        return $this->belongsTo(ClientCompany::class,'company','id');
    }
    public function packageObj(): BelongsTo
    {
        return $this->belongsTo(CompanyPackage::class,'package','id');
    }
}
