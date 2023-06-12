<?php

namespace App\Models\Customer;

use App\Models\Nas\Nas;
use App\Models\Nas\NasProfile;
use App\Models\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravolt\Indonesia\Models\City;
use Laravolt\Indonesia\Models\District;
use Laravolt\Indonesia\Models\Province;
use Laravolt\Indonesia\Models\Village;

class Customer extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $connection = "radius";

    protected $hidden = [
        'nas_username',
        'nas_password',
    ];
    public function userObj(): BelongsTo
    {
        return $this->setConnection("mysql")->belongsTo(User::class,'user','id');
    }
    public function profileObj(): BelongsTo
    {
        return $this->belongsTo(NasProfile::class,'profile','id')->with(['poolObj','bandwidthObj']);
    }
    public function nasObj(): BelongsTo
    {
        return $this->belongsTo(Nas::class,'nas','id');
    }
    public function villageObj(): BelongsTo
    {
        return $this->belongsTo(Village::class,'village','code');
    }
    public function districtObj(): BelongsTo
    {
        return $this->belongsTo(District::class,'district','code');
    }
    public function cityObj(): BelongsTo
    {
        return $this->belongsTo(City::class,'city','code');
    }
    public function provinceObj(): BelongsTo
    {
        return $this->belongsTo(Province::class,'province','code');
    }
    public function createdBy(): BelongsTo
    {
        return $this->setConnection("mysql")->belongsTo(User::class,'created_by','id');
    }
    public function updatedBy(): BelongsTo
    {
        return $this->setConnection("mysql")->belongsTo(User::class,'updated_by','id');
    }
}
