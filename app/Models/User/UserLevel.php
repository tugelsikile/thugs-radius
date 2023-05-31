<?php

namespace App\Models\User;

use App\Models\Company\ClientCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserLevel extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;

    protected $casts = [
        'super' => 'boolean',
        'is_default' => 'boolean',
        'for_client' => 'boolean'
    ];

    public function companyObj() {
        return $this->belongsTo(ClientCompany::class,'company','id');
    }
}
