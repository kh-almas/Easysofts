<?php

namespace Modules\Product\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Modules\Factory\Models\Factory;

// use Modules\Product\Database\Factories\ProductFactory;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'factory_id',
        'type',
        'sku',
        'name',
        'uom',
        'is_active',
        'avg_cost',
        'last_cost',
        'standard_bom_cost',
    ];

    protected $casts = [
        'factory_id' => 'integer',
        'is_active' => 'integer',
        'avg_cost' => 'decimal:6',
        'last_cost' => 'decimal:6',
        'standard_bom_cost' => 'decimal:6',
    ];

    public function factory()
    {
        return $this->belongsTo(Factory::class, 'factory_id');
    }
}
