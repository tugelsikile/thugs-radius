<?php

namespace App\Models\Nas;

use App\Models\Company\ClientCompany;
use App\Models\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Nas extends Model
{
    use HasFactory, softDeletes;
    protected $table = 'nas';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $hidden = [
        'user',
        'secret',
        'salt_hash',
    ];

    public function companyObj(): BelongsTo
    {
        return $this->belongsTo(ClientCompany::class,'company','id')->with(['packageObj']);
    }
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class,'created_by','id');
    }
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class,'updated_by','id');
    }
    public function deletedBy(): BelongsTo
    {
        return $this->belongsTo(User::class,'deleted_by','id');
    }
}
