<?php

namespace App\Models\PaymentGateway;

use App\Models\Company\ClientCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentGatewayToken extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $casts = [
        'params' => 'object'
    ];
    public function companyObj(): BelongsTo
    {
        return $this->belongsTo(ClientCompany::class,'company','id');
    }
    public function paymentGatewayObj(): BelongsTo
    {
        return $this->belongsTo(PaymentGateway::class,'gateway','id');
    }
}
