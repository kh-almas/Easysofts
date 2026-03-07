<?php

namespace Modules\Purchase\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Modules\Factory\Models\Factory;
use Modules\Product\Models\Product;

// use Modules\Purchase\Database\Factories\PurchaseFactory;

class Purchase extends Model
{
    use HasFactory;

    protected $table = 'purchases';

    protected $fillable = [
        'factory_id',
        'purchase_no',
        'supplier_name',
        'purchase_date',
        'raw_product_id',
        'qty',
        'unit_price',
        'total_amount',
        'other_cost',
        'grand_total',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'factory_id' => 'integer',
        'raw_product_id' => 'integer',
        'created_by' => 'integer',
        'purchase_date' => 'date',
        'qty' => 'decimal:6',
        'unit_price' => 'decimal:6',
        'total_amount' => 'decimal:6',
        'other_cost' => 'decimal:6',
        'grand_total' => 'decimal:6',
    ];

    public function factory()
    {
        return $this->belongsTo(Factory::class, 'factory_id');
    }

    public function rawProduct()
    {
        return $this->belongsTo(Product::class, 'raw_product_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // protected static function newFactory(): PurchaseFactory
    // {
    //     // return PurchaseFactory::new();
    // }
}
