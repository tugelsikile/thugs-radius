<?php

namespace App\Models\PaymentGateway;

use App\Models\Company\ClientCompany;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @method static where(string $string, mixed $value)
 * @property mixed|string $id
 * @property mixed $gateway
 * @property mixed $company
 * @property mixed $token
 * @property mixed|string $params
 * @property Carbon|mixed $expired_at
 */
class PaymentGatewayToken extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $casts = [
        'params' => 'object',
        'expired_at' => 'datetime',
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
