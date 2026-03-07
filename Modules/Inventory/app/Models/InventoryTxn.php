<?php

namespace Modules\Inventory\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Modules\BuyerOrder\Models\BuyerOrder;
use Modules\Factory\Models\Factory;
use Modules\Product\Models\Product;
use Modules\Purchase\Models\Purchase;

// use Modules\Inventory\Database\Factories\InventoryTxnFactory;

class InventoryTxn extends Model
{
    use HasFactory;

    protected $table = 'inventory_txns';

    protected $fillable = [
        'factory_id',
        'txn_date',
        'txn_type',
        'product_id',
        'qty_in',
        'qty_out',
        'unit_cost',
        'amount',
        'ref_table',
        'ref_id',
        'buyer_order_id',
        'step_id',
        'purchase_id',
        'shipment_id',
        'note',
        'created_by',
    ];

    protected $casts = [
        'factory_id' => 'integer',
        'product_id' => 'integer',
        'ref_id' => 'integer',
        'buyer_order_id' => 'integer',
        'step_id' => 'integer',
        'purchase_id' => 'integer',
        'shipment_id' => 'integer',
        'created_by' => 'integer',
        'txn_date' => 'datetime',
        'qty_in' => 'decimal:6',
        'qty_out' => 'decimal:6',
        'unit_cost' => 'decimal:6',
        'amount' => 'decimal:6',
    ];

    public function factory()
    {
        return $this->belongsTo(Factory::class, 'factory_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function buyerOrder()
    {
        return $this->belongsTo(BuyerOrder::class, 'buyer_order_id');
    }

    public function purchase()
    {
        return $this->belongsTo(Purchase::class, 'purchase_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // protected static function newFactory(): InventoryTxnFactory
    // {
    //     // return InventoryTxnFactory::new();
    // }
}
