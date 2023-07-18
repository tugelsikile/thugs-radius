<?php

namespace App\Models\Nas;

use App\Models\Company\ClientCompany;
use App\Models\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


/**
 * @property mixed $code
 * @property mixed $module
 * @property mixed $first_address
 * @property mixed $last_address
 * @method static where(string $string, $id)
 */
class NasProfilePool extends Model
{
    use HasFactory;
    protected $connection = "radius";
    protected $keyType = 'string';
    public $incrementing = false;

    public function nasObj(): BelongsTo
    {
        return $this->belongsTo(Nas::class,'nas','id');
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
