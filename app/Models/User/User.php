<?php

namespace App\Models\User;

use App\Models\Company\ClientCompany;
use App\Models\Nas\Nas;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

/**
 * @method static where(string $string, mixed|string $value)
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    protected $connection = "mysql";
    protected $keyType = 'string';
    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'locale' => 'object',
        'is_ghost' => 'boolean',
    ];

    public function levelObj(): BelongsTo
    {
        return $this->belongsTo(UserLevel::class,'level','id');
    }
    public function companyObj(): BelongsTo
    {
        return $this->belongsTo(ClientCompany::class,'company','id')->with(['packageObj','villageObj','districtObj','cityObj','provinceObj']);
    }
    public function nasGroups(): HasMany
    {
        return $this->setConnection('radius')->hasMany(Nas::class,'user','id');
    }
}
