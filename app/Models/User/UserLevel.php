<?php

namespace App\Models\User;

use App\Models\Company\ClientCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property mixed|string $id
 * @method static where(string $string, mixed|string $value)
 */
class UserLevel extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $connection = 'mysql';

    protected $casts = [
        'super' => 'boolean',
        'is_default' => 'boolean',
        'for_client' => 'boolean',
        'for_public' => 'boolean',
        'require_nas' => 'boolean',
    ];

    public function companyObj() {
        return $this->belongsTo(ClientCompany::class,'company','id');
    }
}
