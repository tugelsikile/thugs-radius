<?php

namespace App\Models\Customer;

use App\Models\Nas\Nas;
use App\Models\Nas\NasProfile;
use App\Models\Olt\Olt;
use App\Models\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravolt\Indonesia\Models\City;
use Laravolt\Indonesia\Models\District;
use Laravolt\Indonesia\Models\Province;
use Laravolt\Indonesia\Models\Village;

/**
 * @property mixed $active_at
 * @property mixed $method_type
 * @property mixed $nas_username
 * @property mixed $nas_password
 * @property mixed $due_at
 * @property mixed $profileObj
 * @property mixed $nasObj
 * @method static whereDate(string $string, string $format)
 * @method static where(string $string, mixed $value)
 */
class Customer extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $connection = "radius";

    protected $fillable = [
        'active_at',
        'onu_index',
        'gpon_configs',
    ];
    protected $hidden = [
        'nas_username',
        'nas_password',
    ];
    protected $casts = [
        'is_voucher' => 'boolean',
        'due_at' => 'datetime',
        'gpon_configs' => 'object',
    ];
    protected $with = [
        'userObj',
        'profileObj',
        'nasObj',
        'villageObj',
        'districtObj',
        'cityObj',
        'provinceObj',
    ];
    public function userObj(): BelongsTo
    {
        return $this->setConnection("mysql")->belongsTo(User::class,'user','id');
    }
    public function profileObj(): BelongsTo
    {
        return $this->setConnection('radius')->belongsTo(NasProfile::class,'profile','id')->with(['poolObj','bandwidthObj']);
    }
    public function nasObj(): BelongsTo
    {
        return $this->setConnection('radius')->belongsTo(Nas::class,'nas','id');
    }
    public function villageObj(): BelongsTo
    {
        return $this->setConnection('mysql')->belongsTo(Village::class,'village','code');
    }
    public function districtObj(): BelongsTo
    {
        return $this->setConnection('mysql')->belongsTo(District::class,'district','code');
    }
    public function cityObj(): BelongsTo
    {
        return $this->setConnection('mysql')->belongsTo(City::class,'city','code');
    }
    public function provinceObj(): BelongsTo
    {
        return $this->setConnection('mysql')->belongsTo(Province::class,'province','code');
    }
    public function createdBy(): BelongsTo
    {
        return $this->setConnection("mysql")->belongsTo(User::class,'created_by','id');
    }
    public function updatedBy(): BelongsTo
    {
        return $this->setConnection("mysql")->belongsTo(User::class,'updated_by','id');
    }
    public function activeBy(): BelongsTo {
        return $this->setConnection("mysql")->belongsTo(User::class,'active_by','id');
    }
    public function inactiveBy(): BelongsTo {
        return $this->setConnection("mysql")->belongsTo(User::class,'inactive_by','id');
    }
    public function additionals(): HasMany
    {
        return $this->setConnection('radius')->hasMany(CustomerAdditionalService::class,'customer','id');
    }
    public function taxes(): HasMany
    {
        return $this->setConnection('radius')->hasMany(CustomerTax::class,'customer','id');
    }
    public function discounts(): HasMany
    {
        return $this->setConnection('radius')->hasMany(CustomerDiscount::class,'customer','id');
    }
    public function oltObj(): BelongsTo
    {
        return $this->setConnection('radius')->belongsTo(Olt::class,'olt','id');
    }
}
