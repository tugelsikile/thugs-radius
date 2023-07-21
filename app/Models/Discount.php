<?php

namespace App\Models;

use App\Models\Company\ClientCompany;
use App\Models\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @method static where(string|mixed|null $column, mixed|string|null $value)
 * @property mixed $created_by
 * @property mixed $amount
 * @property mixed $name
 * @property mixed $company
 * @property mixed $code
 * @property mixed $id
 * @property mixed $updated_by
 * @property mixed $updated_at
 * @property mixed $created_at
 */
class Discount extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $connection = "mysql";

    protected $casts = [
        'amount' => 'double',
    ];

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
