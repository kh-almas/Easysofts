<?php

namespace Modules\Product\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Modules\Factory\Models\Factory;

// use Modules\Product\Database\Factories\BomItemFactory;

class BomItem extends Model
{
    use HasFactory;

    protected $table = 'bom_items';

    protected $fillable = [
        'factory_id',
        'fg_product_id',
        'raw_product_id',
        'qty_per_unit',
        'waste_percent',
        'notes',
    ];

    protected $casts = [
        'factory_id' => 'integer',
        'fg_product_id' => 'integer',
        'raw_product_id' => 'integer',
        'qty_per_unit' => 'decimal:6',
        'waste_percent' => 'decimal:3',
    ];

    public function factory()
    {
        return $this->belongsTo(Factory::class, 'factory_id');
    }

    public function fgProduct()
    {
        return $this->belongsTo(Product::class, 'fg_product_id');
    }

    public function rawProduct()
    {
        return $this->belongsTo(Product::class, 'raw_product_id');
    }

    // protected static function newFactory(): BomItemFactory
    // {
    //     // return BomItemFactory::new();
    // }
}
