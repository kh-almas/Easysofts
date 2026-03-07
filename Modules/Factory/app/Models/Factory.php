<?php

namespace Modules\Factory\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Modules\Factory\Database\Factories\FactoryFactory;

class Factory extends Model
{
    use HasFactory;
    protected $table = 'factories';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = ['name', 'code', 'address', 'status'];

    protected $casts = [
        'status' => 'integer',
    ];
}
