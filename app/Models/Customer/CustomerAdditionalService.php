<?php

namespace App\Models\Customer;

use App\Models\Nas\NasProfile;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerAdditionalService extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $connection = "radius";

    public function serviceObj(): BelongsTo
    {
        return $this->setConnection("radius")->belongsTo(NasProfile::class,'profile','id');
    }
}
