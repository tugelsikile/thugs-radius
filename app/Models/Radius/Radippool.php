<?php

namespace App\Models\Radius;

use App\Models\Customer\Customer;
use App\Models\Nas\NasProfilePool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
