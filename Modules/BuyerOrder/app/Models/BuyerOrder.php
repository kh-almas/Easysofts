<?php

namespace Modules\BuyerOrder\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Modules\Factory\Models\Factory;
use Modules\Product\Models\Product;

// use Modules\BuyerOrder\Database\Factories\BuyerOrderFactory;

class BuyerOrder extends Model
{
    use HasFactory;

    protected $table = 'buyer_orders';

    protected $fillable = [
        'factory_id',
        'buyer_name',
        'buyer_order_no',
        'order_date',
        'delivery_date',
        'fg_product_id',
        'order_qty',
        'planned_start_date',
        'planned_end_date',
        'status',
        'produced_qty',
        'shipped_qty',
        'created_by',
    ];

    protected $casts = [
        'factory_id' => 'integer',
        'fg_product_id' => 'integer',
        'created_by' => 'integer',
        'order_date' => 'date',
        'delivery_date' => 'date',
        'planned_start_date' => 'date',
        'planned_end_date' => 'date',
        'order_qty' => 'decimal:6',
        'produced_qty' => 'decimal:6',
        'shipped_qty' => 'decimal:6',
    ];

    public function factory()
    {
        return $this->belongsTo(Factory::class, 'factory_id');
    }

    public function fgProduct()
    {
        return $this->belongsTo(Product::class, 'fg_product_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // protected static function newFactory(): BuyerOrderFactory
    // {
    //     // return BuyerOrderFactory::new();
    // }
}
