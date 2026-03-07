<?php

namespace Modules\BuyerOrder\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Modules\BuyerOrder\Models\BuyerOrder;
use Modules\Factory\Models\Factory;
use Modules\Product\Models\Product;

class BuyerOrderController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->string('q')->toString();
        $factoryId = $request->input('factory_id');
        $status = $request->string('status')->toString();

        $buyerOrders = BuyerOrder::query()
            ->with([
                'factory:id,name,code',
                'fgProduct:id,factory_id,type,sku,name',
                'creator:id,name',
            ])
            ->when($q, function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->where('buyer_name', 'like', "%{$q}%")
                        ->orWhere('buyer_order_no', 'like', "%{$q}%")
                        ->orWhereHas('fgProduct', function ($productQuery) use ($q) {
                            $productQuery->where('name', 'like', "%{$q}%")
                                ->orWhere('sku', 'like', "%{$q}%");
                        });
                });
            })
            ->when($factoryId, function ($query) use ($factoryId) {
                $query->where('factory_id', $factoryId);
            })
            ->when($status, function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        $factories = Factory::query()
            ->where('status', 1)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        $fgProducts = Product::query()
            ->where('type', 'FG')
            ->where('is_active', 1)
            ->orderBy('name')
            ->get(['id', 'factory_id', 'sku', 'name']);

        return Inertia::render('modules/buyer-orders/Index', [
            'buyerOrders' => $buyerOrders,
            'factories' => $factories,
            'fgProducts' => $fgProducts,
            'filters' => [
                'q' => $q,
                'factory_id' => $factoryId ? (int) $factoryId : '',
                'status' => $status,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'factory_id' => ['required', 'integer', 'exists:factories,id'],
            'buyer_name' => ['required', 'string', 'max:255'],
            'buyer_order_no' => [
                'required',
                'string',
                'max:255',
                Rule::unique('buyer_orders', 'buyer_order_no')->where(function ($query) use ($request) {
                    return $query->where('factory_id', $request->factory_id);
                }),
            ],
            'order_date' => ['required', 'date'],
            'delivery_date' => ['nullable', 'date'],
            'fg_product_id' => ['required', 'integer', 'exists:products,id'],
            'order_qty' => ['required', 'numeric', 'gt:0'],
            'planned_start_date' => ['nullable', 'date'],
            'planned_end_date' => ['nullable', 'date'],
            'status' => [
                'required',
                'string',
                Rule::in(['draft', 'confirmed', 'in_production', 'ready', 'shipped', 'cancelled']),
            ],
            'produced_qty' => ['nullable', 'numeric', 'min:0'],
            'shipped_qty' => ['nullable', 'numeric', 'min:0'],
        ]);

        $fgProduct = Product::query()
            ->where('id', $data['fg_product_id'])
            ->where('factory_id', $data['factory_id'])
            ->where('type', 'FG')
            ->first();

        if (!$fgProduct) {
            return back()->withErrors([
                'fg_product_id' => 'Selected FG product is invalid for this factory.',
            ])->withInput();
        }

        $data['produced_qty'] = $data['produced_qty'] ?? 0;
        $data['shipped_qty'] = $data['shipped_qty'] ?? 0;
        $data['created_by'] = auth()->id();

        BuyerOrder::create($data);

        return back()->with('success', 'Buyer order created successfully.');
    }

    public function update(Request $request, BuyerOrder $buyerOrder)
    {
        $data = $request->validate([
            'factory_id' => ['required', 'integer', 'exists:factories,id'],
            'buyer_name' => ['required', 'string', 'max:255'],
            'buyer_order_no' => [
                'required',
                'string',
                'max:255',
                Rule::unique('buyer_orders', 'buyer_order_no')
                    ->where(function ($query) use ($request) {
                        return $query->where('factory_id', $request->factory_id);
                    })
                    ->ignore($buyerOrder->id),
            ],
            'order_date' => ['required', 'date'],
            'delivery_date' => ['nullable', 'date'],
            'fg_product_id' => ['required', 'integer', 'exists:products,id'],
            'order_qty' => ['required', 'numeric', 'gt:0'],
            'planned_start_date' => ['nullable', 'date'],
            'planned_end_date' => ['nullable', 'date'],
            'status' => [
                'required',
                'string',
                Rule::in(['draft', 'confirmed', 'in_production', 'ready', 'shipped', 'cancelled']),
            ],
            'produced_qty' => ['nullable', 'numeric', 'min:0'],
            'shipped_qty' => ['nullable', 'numeric', 'min:0'],
        ]);

        $fgProduct = Product::query()
            ->where('id', $data['fg_product_id'])
            ->where('factory_id', $data['factory_id'])
            ->where('type', 'FG')
            ->first();

        if (!$fgProduct) {
            return back()->withErrors([
                'fg_product_id' => 'Selected FG product is invalid for this factory.',
            ])->withInput();
        }

        $data['produced_qty'] = $data['produced_qty'] ?? 0;
        $data['shipped_qty'] = $data['shipped_qty'] ?? 0;

        $buyerOrder->update($data);

        return back()->with('success', 'Buyer order updated successfully.');
    }

    public function destroy(BuyerOrder $buyerOrder)
    {
        $buyerOrder->delete();

        return back()->with('success', 'Buyer order deleted successfully.');
    }
}
