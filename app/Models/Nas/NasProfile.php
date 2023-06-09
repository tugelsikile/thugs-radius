<?php

namespace App\Models\Nas;

use App\Models\Company\ClientCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NasProfile extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;

    protected $casts = [
        'price' => 'double',
        'is_additional' => 'boolean',
        'dns_servers' => 'object',
        'parent_queue' => 'object',
    ];

    public function companyObj(): BelongsTo
    {
        return $this->belongsTo(ClientCompany::class,'company','id');
    }
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
