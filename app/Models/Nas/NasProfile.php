<?php

namespace App\Models\Nas;

use App\Models\Company\ClientCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


/**
 * @property mixed $code
 * @property mixed $poolObj
 * @property mixed $bandwidthObj
 * @property mixed $limit_type
 * @property mixed $limit_rate
 * @property mixed $limit_rate_unit
 * @property mixed $is_additional
 * @property mixed $type
 * @property mixed $id
 * @property mixed $dns_servers
 */
class NasProfile extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $connection = "radius";

    protected $casts = [
        'price' => 'double',
        'is_additional' => 'boolean',
        'dns_servers' => 'object',
        'parent_queue' => 'object',
    ];

    public function nasObj(): BelongsTo
    {
        return $this->belongsTo(Nas::class,'nas','id');
    }
    public function poolObj(): BelongsTo
    {
        return $this->belongsTo(NasProfilePool::class,'pool','id');
    }
    public function bandwidthObj(): BelongsTo
    {
        return $this->belongsTo(NasProfileBandwidth::class,'bandwidth','id');
    }
}
