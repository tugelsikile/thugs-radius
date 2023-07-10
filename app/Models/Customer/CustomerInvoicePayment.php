<?php

namespace App\Models\Customer;

use App\Models\User\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @method static whereDate(string $string, string $format)
 * @property mixed|string $id
 * @property mixed $invoice
 * @property false|mixed|string $code
 * @property int|mixed $amount
 * @property mixed $note
 * @property array|mixed $pg_response
 * @property Carbon|mixed $paid_at
 * @property mixed $created_by
 * @property mixed $paid_amount
 * @property mixed $paid_by
 */
class CustomerInvoicePayment extends Model
{
    use HasFactory, softDeletes;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $connection = "radius";

    protected $casts = [
        'pg_response' => 'object',
        'amount' => 'double',
        'paid_at' => 'datetime',
    ];
    public function invoiceObj(): BelongsTo
    {
        return $this->belongsTo(CustomerInvoice::class,'invoice','id');
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
