<?php

namespace App\Models\Customer;

use App\Models\Discount;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerDiscount extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $connection = "radius";

    public function discountObj(): BelongsTo
    {
        return $this->setConnection("mysql")->belongsTo(Discount::class,'discount','id');
    }
}
