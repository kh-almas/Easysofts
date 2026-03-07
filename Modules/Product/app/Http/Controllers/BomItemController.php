<?php

namespace Modules\Product\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Modules\Factory\Models\Factory;
use Modules\Product\Models\BomItem;
use Modules\Product\Models\Product;

class BomItemController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->string('q')->toString();
        $factoryId = $request->input('factory_id');

        $bomItems = BomItem::query()
            ->with([
                'factory:id,name,code',
                'fgProduct:id,factory_id,type,sku,name',
                'rawProduct:id,factory_id,type,sku,name',
            ])
            ->when($q, function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->whereHas('fgProduct', function ($productQuery) use ($q) {
                        $productQuery->where('name', 'like', "%{$q}%")
                            ->orWhere('sku', 'like', "%{$q}%");
                    })->orWhereHas('rawProduct', function ($productQuery) use ($q) {
                        $productQuery->where('name', 'like', "%{$q}%")
                            ->orWhere('sku', 'like', "%{$q}%");
                    })->orWhere('notes', 'like', "%{$q}%");
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

        $fgProducts = Product::query()
            ->where('type', 'FG')
            ->where('is_active', 1)
            ->orderBy('name')
            ->get(['id', 'factory_id', 'sku', 'name']);

        $rawProducts = Product::query()
            ->where('type', 'RAW')
            ->where('is_active', 1)
            ->orderBy('name')
            ->get(['id', 'factory_id', 'sku', 'name']);

        return Inertia::render('modules/products/BomItem', [
            'bomItems' => $bomItems,
            'factories' => $factories,
            'fgProducts' => $fgProducts,
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
            'fg_product_id' => [
                'required',
                'integer',
                'exists:products,id',
                Rule::unique('bom_items')->where(function ($query) use ($request) {
                    return $query
                        ->where('factory_id', $request->factory_id)
                        ->where('fg_product_id', $request->fg_product_id)
                        ->where('raw_product_id', $request->raw_product_id);
                }),
            ],
            'raw_product_id' => ['required', 'integer', 'exists:products,id', 'different:fg_product_id'],
            'qty_per_unit' => ['required', 'numeric', 'gt:0'],
            'waste_percent' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ], [
            'fg_product_id.unique' => 'This FG and RAW combination already exists in this factory.',
            'raw_product_id.different' => 'FG product and RAW product must be different.',
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

        $data['waste_percent'] = $data['waste_percent'] ?? 0;

        BomItem::create($data);

        return back()->with('success', 'BOM item created successfully.');
    }

    public function update(Request $request, BomItem $bomItem)
    {
        $data = $request->validate([
            'factory_id' => ['required', 'integer', 'exists:factories,id'],
            'fg_product_id' => [
                'required',
                'integer',
                'exists:products,id',
                Rule::unique('bom_items')->where(function ($query) use ($request) {
                    return $query
                        ->where('factory_id', $request->factory_id)
                        ->where('fg_product_id', $request->fg_product_id)
                        ->where('raw_product_id', $request->raw_product_id);
                })->ignore($bomItem->id),
            ],
            'raw_product_id' => ['required', 'integer', 'exists:products,id', 'different:fg_product_id'],
            'qty_per_unit' => ['required', 'numeric', 'gt:0'],
            'waste_percent' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ], [
            'fg_product_id.unique' => 'This FG and RAW combination already exists in this factory.',
            'raw_product_id.different' => 'FG product and RAW product must be different.',
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

        $data['waste_percent'] = $data['waste_percent'] ?? 0;

        $bomItem->update($data);

        return back()->with('success', 'BOM item updated successfully.');
    }

    public function destroy(BomItem $bomItem)
    {
        $bomItem->delete();

        return back()->with('success', 'BOM item deleted successfully.');
    }
}
