<?php

namespace App\Models\PaymentGateway;

use App\Models\Company\ClientCompany;
use App\Models\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @method static where(string $string, mixed $value)
 * @property mixed $id
 * @property mixed $company
 * @property mixed $keys
 */
class PaymentGateway extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;

    protected $casts = [
        'keys' => 'object',
        'production' => 'boolean',
        'active_at' => 'datetime',
    ];

    public function companyObj(): BelongsTo
    {
        return $this->belongsTo(ClientCompany::class,'company','id');
    }
    public function activeBy(): BelongsTo
    {
        return $this->belongsTo(User::class,'active_by','id');
    }
}
