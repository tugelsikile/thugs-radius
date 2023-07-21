<?php

namespace App\Models;

use App\Models\Company\ClientCompany;
use App\Models\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @method static where(string|mixed|null $column, string|mixed|null $value)
 * @property mixed $id
 * @property mixed $name
 * @property mixed $company
 * @property mixed $code
 * @property mixed $description
 * @property mixed $percent
 * @property mixed $created_by
 * @property mixed $updated_by
 * @property mixed $created_at
 * @property mixed $updated_at
 */
class Tax extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $connection = "mysql";
    protected $fillable = [
        'id', 'name', 'company', 'code', 'description', 'percent',
    ];
    protected $casts = [
        'percent' => 'double'
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
