<?php

namespace App\Models\Company;

use App\Models\User\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravolt\Indonesia\Models\City;
use Laravolt\Indonesia\Models\District;
use Laravolt\Indonesia\Models\Province;
use Laravolt\Indonesia\Models\Village;

/**
 * @method static where(string $column, null|string $operator, mixed|string $value)
 * @method static whereIn(string $column, mixed|array $value)
 * @method static orderBy(string $column, string $orderDirection)
 * @property mixed $radius_db_host
 * @property mixed $radius_db_name
 * @property mixed $radius_db_pass
 * @property mixed $radius_db_user
 * @property mixed $config
 * @property mixed|string $id
 * @property mixed $name
 * @property mixed $package
 * @property mixed|string $code
 * @property mixed $email
 * @property Carbon|mixed $active_at
 * @property Carbon|mixed|null $expired_at
 * @property mixed $currency
 * @property mixed $address
 * @property mixed|null $domain
 * @property mixed $province
 * @property mixed $city
 * @property mixed $district
 * @property mixed $village
 * @property mixed $postal
 * @property mixed $phone
 * @property mixed $active_by
 * @property mixed $packageObj
 */
class ClientCompany extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $connection = 'mysql';

    protected $hidden = [
        'radius_db_host',
        'radius_db_name',
        'radius_db_user',
        'radius_db_pass',
    ];
    protected $casts = [
        'discount' => 'double',
        'active_at' => 'datetime',
        'expired_at' => 'datetime',
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
