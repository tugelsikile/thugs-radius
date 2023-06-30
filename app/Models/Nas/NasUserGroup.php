<?php

namespace App\Models\Nas;

use App\Models\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NasUserGroup extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $connection = 'radius';

    public function userObj(): BelongsTo
    {
        return $this->setConnection('mysql')->belongsTo(User::class,'user','id');
    }
    public function nasObj(): BelongsTo
    {
        return $this->setConnection('radius')->belongsTo(Nas::class,'nas','id');
    }
}
