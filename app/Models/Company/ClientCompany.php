<?php

namespace App\Models\Company;

use App\Models\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravolt\Indonesia\Models\City;
use Laravolt\Indonesia\Models\District;
use Laravolt\Indonesia\Models\Province;
use Laravolt\Indonesia\Models\Village;

class ClientCompany extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;

    protected $hidden = [
        'radius_db_host',
        'radius_db_name',
        'radius_db_user',
        'radius_db_pass',
    ];
    protected $casts = [
        'discount' => 'double',
        'active_at' => 'datetime',
        'config' => 'object',
    ];

    public function packageObj(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(CompanyPackage::class,'package','id');
    }
    public function provinceObj(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Province::class,'province','code');
    }
    public function cityObj(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(City::class,'city','code');
    }
    public function districtObj(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(District::class,'district','code');
    }
    public function villageObj(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Village::class,'village','code');
    }
    public function userCollection(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(User::class,'company','id');
    }
    public function activeBy(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class,'active_by','id');
    }
}
