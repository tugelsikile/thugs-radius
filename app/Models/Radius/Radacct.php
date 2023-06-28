<?php

namespace App\Models\Radius;

use App\Models\Customer\Customer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @method static orderBy(string $string, string $string1)
 * @method static where(string $string, $username)
 * @method static whereNotIn(string $string, string[] $array)
 */
class Radacct extends Model
{
    use HasFactory;
    protected $table = "radacct";
    protected $connection = "radius";
    public $timestamps = false;

    public function customerObj(): BelongsTo
    {
        return $this->belongsTo(Customer::class,'username','nas_username');
    }
}
