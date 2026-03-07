<?php

namespace Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Modules\BuyerOrder\Models\BuyerOrder;
use Modules\Factory\Models\Factory;
use Modules\Inventory\Models\InventoryTxn;
use Modules\Product\Models\Product;
use Modules\Purchase\Models\Purchase;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->string('q')->toString();
        $factoryId = $request->input('factory_id');
        $txnType = $request->string('txn_type')->toString();

        $inventoryTxns = InventoryTxn::query()
            ->with([
                'factory:id,name,code',
                'product:id,factory_id,type,sku,name',
                'buyerOrder:id,buyer_order_no',
                'purchase:id,purchase_no',
                'creator:id,name',
            ])
            ->when($q, function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->where('ref_id', 'like', "%{$q}%")
                        ->orWhere('note', 'like', "%{$q}%")
                        ->orWhereHas('product', function ($productQuery) use ($q) {
                            $productQuery->where('name', 'like', "%{$q}%")
                                ->orWhere('sku', 'like', "%{$q}%");
                        })
                        ->orWhereHas('buyerOrder', function ($orderQuery) use ($q) {
                            $orderQuery->where('buyer_order_no', 'like', "%{$q}%");
                        })
                        ->orWhereHas('purchase', function ($purchaseQuery) use ($q) {
                            $purchaseQuery->where('purchase_no', 'like', "%{$q}%");
                        });
                });
            })
            ->when($factoryId, function ($query) use ($factoryId) {
                $query->where('factory_id', $factoryId);
            })
            ->when($txnType, function ($query) use ($txnType) {
                $query->where('txn_type', $txnType);
            })
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        $factories = Factory::query()
            ->where('status', 1)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        $products = Product::query()
            ->where('is_active', 1)
            ->orderBy('name')
            ->get(['id', 'factory_id', 'type', 'sku', 'name']);

        $buyerOrders = BuyerOrder::query()
            ->orderByDesc('id')
            ->get(['id', 'factory_id', 'buyer_order_no']);

        $purchases = Purchase::query()
            ->orderByDesc('id')
            ->get(['id', 'factory_id', 'purchase_no']);

        return Inertia::render('modules/inventory-txns/Index', [
            'inventoryTxns' => $inventoryTxns,
            'factories' => $factories,
            'products' => $products,
            'buyerOrders' => $buyerOrders,
            'purchases' => $purchases,
            'filters' => [
                'q' => $q,
                'factory_id' => $factoryId ? (int) $factoryId : '',
                'txn_type' => $txnType,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'factory_id' => ['required', 'integer', 'exists:factories,id'],
            'txn_date' => ['required', 'date'],
            'txn_type' => [
                'required',
                'string',
                Rule::in([
                    'PURCHASE_IN',
                    'PRODUCTION_RAW_OUT',
                    'FG_IN',
                    'SHIPMENT_OUT',
                    'DAMAGE_OUT',
                    'ADJUSTMENT_IN',
                    'ADJUSTMENT_OUT',
                ]),
            ],
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'qty_in' => ['nullable', 'numeric', 'min:0'],
            'qty_out' => ['nullable', 'numeric', 'min:0'],
            'unit_cost' => ['nullable', 'numeric', 'min:0'],
            'ref_table' => [
                'required',
                'string',
                Rule::in(['purchases', 'buyer_orders', 'production_steps', 'shipments', 'manual']),
            ],
            'ref_id' => ['nullable', 'integer', 'min:1'],
            'buyer_order_id' => ['nullable', 'integer', 'exists:buyer_orders,id'],
            'step_id' => ['nullable', 'integer', 'min:1'],
            'purchase_id' => ['nullable', 'integer', 'exists:purchases,id'],
            'shipment_id' => ['nullable', 'integer', 'min:1'],
            'note' => ['nullable', 'string'],
        ]);

        $product = Product::query()
            ->where('id', $data['product_id'])
            ->where('factory_id', $data['factory_id'])
            ->first();

        if (!$product) {
            return back()->withErrors([
                'product_id' => 'Selected product is invalid for this factory.',
            ])->withInput();
        }

        if (($data['txn_type'] === 'PURCHASE_IN' || $data['txn_type'] === 'PRODUCTION_RAW_OUT') && $product->type !== 'RAW') {
            return back()->withErrors([
                'product_id' => 'Selected product must be RAW for this transaction type.',
            ])->withInput();
        }

        if (($data['txn_type'] === 'FG_IN' || $data['txn_type'] === 'SHIPMENT_OUT') && $product->type !== 'FG') {
            return back()->withErrors([
                'product_id' => 'Selected product must be FG for this transaction type.',
            ])->withInput();
        }

        $qtyIn = isset($data['qty_in']) ? (float) $data['qty_in'] : 0;
        $qtyOut = isset($data['qty_out']) ? (float) $data['qty_out'] : 0;
        $unitCost = isset($data['unit_cost']) ? (float) $data['unit_cost'] : 0;

        if ($qtyIn <= 0 && $qtyOut <= 0) {
            return back()->withErrors([
                'qty_in' => 'Either qty in or qty out must be greater than zero.',
                'qty_out' => 'Either qty in or qty out must be greater than zero.',
            ])->withInput();
        }

        if ($qtyIn > 0 && $qtyOut > 0) {
            return back()->withErrors([
                'qty_in' => 'You cannot set both qty in and qty out at the same time.',
                'qty_out' => 'You cannot set both qty in and qty out at the same time.',
            ])->withInput();
        }

        $data['qty_in'] = $qtyIn;
        $data['qty_out'] = $qtyOut;
        $data['unit_cost'] = $unitCost;
        $data['amount'] = round(($qtyIn - $qtyOut) * $unitCost, 6);
        $data['created_by'] = auth()->id();

        InventoryTxn::create($data);

        return back()->with('success', 'Inventory transaction created successfully.');
    }

    public function update(Request $request, InventoryTxn $inventoryTxn)
    {
        $data = $request->validate([
            'factory_id' => ['required', 'integer', 'exists:factories,id'],
            'txn_date' => ['required', 'date'],
            'txn_type' => [
                'required',
                'string',
                Rule::in([
                    'PURCHASE_IN',
                    'PRODUCTION_RAW_OUT',
                    'FG_IN',
                    'SHIPMENT_OUT',
                    'DAMAGE_OUT',
                    'ADJUSTMENT_IN',
                    'ADJUSTMENT_OUT',
                ]),
            ],
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'qty_in' => ['nullable', 'numeric', 'min:0'],
            'qty_out' => ['nullable', 'numeric', 'min:0'],
            'unit_cost' => ['nullable', 'numeric', 'min:0'],
            'ref_table' => [
                'required',
                'string',
                Rule::in(['purchases', 'buyer_orders', 'production_steps', 'shipments', 'manual']),
            ],
            'ref_id' => ['nullable', 'integer', 'min:1'],
            'buyer_order_id' => ['nullable', 'integer', 'exists:buyer_orders,id'],
            'step_id' => ['nullable', 'integer', 'min:1'],
            'purchase_id' => ['nullable', 'integer', 'exists:purchases,id'],
            'shipment_id' => ['nullable', 'integer', 'min:1'],
            'note' => ['nullable', 'string'],
        ]);

        $product = Product::query()
            ->where('id', $data['product_id'])
            ->where('factory_id', $data['factory_id'])
            ->first();

        if (!$product) {
            return back()->withErrors([
                'product_id' => 'Selected product is invalid for this factory.',
            ])->withInput();
        }

        if (($data['txn_type'] === 'PURCHASE_IN' || $data['txn_type'] === 'PRODUCTION_RAW_OUT') && $product->type !== 'RAW') {
            return back()->withErrors([
                'product_id' => 'Selected product must be RAW for this transaction type.',
            ])->withInput();
        }

        if (($data['txn_type'] === 'FG_IN' || $data['txn_type'] === 'SHIPMENT_OUT') && $product->type !== 'FG') {
            return back()->withErrors([
                'product_id' => 'Selected product must be FG for this transaction type.',
            ])->withInput();
        }

        $qtyIn = isset($data['qty_in']) ? (float) $data['qty_in'] : 0;
        $qtyOut = isset($data['qty_out']) ? (float) $data['qty_out'] : 0;
        $unitCost = isset($data['unit_cost']) ? (float) $data['unit_cost'] : 0;

        if ($qtyIn <= 0 && $qtyOut <= 0) {
            return back()->withErrors([
                'qty_in' => 'Either qty in or qty out must be greater than zero.',
                'qty_out' => 'Either qty in or qty out must be greater than zero.',
            ])->withInput();
        }

        if ($qtyIn > 0 && $qtyOut > 0) {
            return back()->withErrors([
                'qty_in' => 'You cannot set both qty in and qty out at the same time.',
                'qty_out' => 'You cannot set both qty in and qty out at the same time.',
            ])->withInput();
        }

        $data['qty_in'] = $qtyIn;
        $data['qty_out'] = $qtyOut;
        $data['unit_cost'] = $unitCost;
        $data['amount'] = round(($qtyIn - $qtyOut) * $unitCost, 6);

        $inventoryTxn->update($data);

        return back()->with('success', 'Inventory transaction updated successfully.');
    }

    public function destroy(InventoryTxn $inventoryTxn)
    {
        $inventoryTxn->delete();

        return back()->with('success', 'Inventory transaction deleted successfully.');
    }
}
