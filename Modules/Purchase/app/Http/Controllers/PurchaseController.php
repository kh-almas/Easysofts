<?php

namespace Modules\Purchase\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Modules\Factory\Models\Factory;
use Modules\Product\Models\Product;
use Modules\Purchase\Models\Purchase;

class PurchaseController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->string('q')->toString();
        $factoryId = $request->input('factory_id');

        $purchases = Purchase::query()
            ->with([
                'factory:id,name,code',
                'rawProduct:id,factory_id,type,sku,name',
                'creator:id,name',
            ])
            ->when($q, function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->where('purchase_no', 'like', "%{$q}%")
                        ->orWhere('supplier_name', 'like', "%{$q}%")
                        ->orWhereHas('rawProduct', function ($productQuery) use ($q) {
                            $productQuery->where('name', 'like', "%{$q}%")
                                ->orWhere('sku', 'like', "%{$q}%");
                        });
                });
            })
            ->when($factoryId, function ($query) use ($factoryId) {
                $query->where('factory_id', $factoryId);
            })
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        $factories = Factory::query()
            ->where('status', 1)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        $rawProducts = Product::query()
            ->where('type', 'RAW')
            ->where('is_active', 1)
            ->orderBy('name')
            ->get(['id', 'factory_id', 'sku', 'name']);

        return Inertia::render('modules/purchases/Index', [
            'purchases' => $purchases,
            'factories' => $factories,
            'rawProducts' => $rawProducts,
            'filters' => [
                'q' => $q,
                'factory_id' => $factoryId ? (int) $factoryId : '',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'factory_id' => ['required', 'integer', 'exists:factories,id'],
            'purchase_no' => [
                'required',
                'string',
                'max:255',
                Rule::unique('purchases', 'purchase_no')->where(function ($query) use ($request) {
                    return $query->where('factory_id', $request->factory_id);
                }),
            ],
            'supplier_name' => ['required', 'string', 'max:255'],
            'purchase_date' => ['required', 'date'],
            'raw_product_id' => ['required', 'integer', 'exists:products,id'],
            'qty' => ['required', 'numeric', 'gt:0'],
            'unit_price' => ['required', 'numeric', 'min:0'],
            'other_cost' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        $rawProduct = Product::query()
            ->where('id', $data['raw_product_id'])
            ->where('factory_id', $data['factory_id'])
            ->where('type', 'RAW')
            ->first();

        if (!$rawProduct) {
            return back()->withErrors([
                'raw_product_id' => 'Selected RAW product is invalid for this factory.',
            ])->withInput();
        }

        $qty = (float) $data['qty'];
        $unitPrice = (float) $data['unit_price'];
        $otherCost = isset($data['other_cost']) ? (float) $data['other_cost'] : 0;

        $data['total_amount'] = round($qty * $unitPrice, 6);
        $data['other_cost'] = $otherCost;
        $data['grand_total'] = round($data['total_amount'] + $otherCost, 6);
        $data['created_by'] = auth()->id();

        Purchase::create($data);

        return back()->with('success', 'Purchase created successfully.');
    }

    public function update(Request $request, Purchase $purchase)
    {
        $data = $request->validate([
            'factory_id' => ['required', 'integer', 'exists:factories,id'],
            'purchase_no' => [
                'required',
                'string',
                'max:255',
                Rule::unique('purchases', 'purchase_no')
                    ->where(function ($query) use ($request) {
                        return $query->where('factory_id', $request->factory_id);
                    })
                    ->ignore($purchase->id),
            ],
            'supplier_name' => ['required', 'string', 'max:255'],
            'purchase_date' => ['required', 'date'],
            'raw_product_id' => ['required', 'integer', 'exists:products,id'],
            'qty' => ['required', 'numeric', 'gt:0'],
            'unit_price' => ['required', 'numeric', 'min:0'],
            'other_cost' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        $rawProduct = Product::query()
            ->where('id', $data['raw_product_id'])
            ->where('factory_id', $data['factory_id'])
            ->where('type', 'RAW')
            ->first();

        if (!$rawProduct) {
            return back()->withErrors([
                'raw_product_id' => 'Selected RAW product is invalid for this factory.',
            ])->withInput();
        }

        $qty = (float) $data['qty'];
        $unitPrice = (float) $data['unit_price'];
        $otherCost = isset($data['other_cost']) ? (float) $data['other_cost'] : 0;

        $data['total_amount'] = round($qty * $unitPrice, 6);
        $data['other_cost'] = $otherCost;
        $data['grand_total'] = round($data['total_amount'] + $otherCost, 6);

        $purchase->update($data);

        return back()->with('success', 'Purchase updated successfully.');
    }

    public function destroy(Purchase $purchase)
    {
        $purchase->delete();

        return back()->with('success', 'Purchase deleted successfully.');
    }
}
