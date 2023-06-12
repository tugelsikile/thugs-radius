<?php

namespace App\Models\Customer;

use App\Models\Tax;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerTax extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;

    public function taxObj(): BelongsTo
    {
        return $this->setConnection("mysql")->belongsTo(Tax::class,'tax','id');
    }
}
