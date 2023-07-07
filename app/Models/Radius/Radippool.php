<?php

namespace App\Models\Radius;

use App\Models\Customer\Customer;
use App\Models\Nas\NasProfilePool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property mixed|string|null $pool_name
 * @property mixed|string|null $framedipaddress
 * @property mixed|string|null $calledstationid
 * @property mixed|string|null $callingstationid
 * @property mixed|string|null $username
 * @method static where(string $column, mixed|string $value)
 * @method static whereIn(string $column, array $value)
 */
class Radippool extends Model
{
    use HasFactory;
    protected $table = 'radippool';
    public $timestamps = false;
    protected $connection = 'radius';

    public function poolObj(): BelongsTo
    {
        return $this->setConnection('radius')->belongsTo(NasProfilePool::class,'pool_name','code');
    }
    public function customerObj(): BelongsTo
    {
        return $this->setConnection('radius')->belongsTo(Customer::class,'username','nas_username');
    }
}
