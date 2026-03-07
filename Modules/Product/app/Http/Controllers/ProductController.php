<?php

namespace Modules\Product\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Modules\Factory\Models\Factory;
use Modules\Product\Models\Product;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->string('q')->toString();
        $factoryId = $request->input('factory_id');
        $type = $request->string('type')->toString();
        $status = $request->input('is_active');

        $products = Product::query()
            ->with('factory:id,name,code')
            ->when($q, function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->where('name', 'like', "%{$q}%")
                        ->orWhere('sku', 'like', "%{$q}%")
                        ->orWhere('uom', 'like', "%{$q}%");
                });
            })
            ->when($factoryId, function ($query) use ($factoryId) {
                $query->where('factory_id', $factoryId);
            })
            ->when($type, function ($query) use ($type) {
                $query->where('type', $type);
            })
            ->when($status !== null && $status !== '', function ($query) use ($status) {
                $query->where('is_active', (int) $status);
            })
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        $factories = Factory::query()
            ->where('status', 1)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        return Inertia::render('modules/products/Index', [
            'products' => $products,
            'factories' => $factories,
            'filters' => [
                'q' => $q,
                'factory_id' => $factoryId ? (int) $factoryId : '',
                'type' => $type,
                'is_active' => ($status !== null && $status !== '') ? (int) $status : '',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'factory_id' => ['required', 'integer', 'exists:factories,id'],
            'type' => ['required', 'string', Rule::in(['RAW', 'FG'])],
            'sku' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products', 'sku')->where(function ($query) use ($request) {
                    return $query->where('factory_id', $request->factory_id);
                }),
            ],
            'name' => ['required', 'string', 'max:255'],
            'uom' => ['required', 'string', 'max:20'],
            'is_active' => ['required', 'integer', 'in:0,1'],
            'avg_cost' => ['nullable', 'numeric', 'min:0'],
            'last_cost' => ['nullable', 'numeric', 'min:0'],
            'standard_bom_cost' => ['nullable', 'numeric', 'min:0'],
        ]);

        $data['avg_cost'] = $data['avg_cost'] ?? 0;
        $data['last_cost'] = $data['last_cost'] ?? 0;
        $data['standard_bom_cost'] = $data['standard_bom_cost'] ?? 0;

        Product::create($data);

        return back()->with('success', 'Product created successfully.');
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'factory_id' => ['required', 'integer', 'exists:factories,id'],
            'type' => ['required', 'string', Rule::in(['RAW', 'FG'])],
            'sku' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products', 'sku')
                    ->where(function ($query) use ($request) {
                        return $query->where('factory_id', $request->factory_id);
                    })
                    ->ignore($product->id),
            ],
            'name' => ['required', 'string', 'max:255'],
            'uom' => ['required', 'string', 'max:20'],
            'is_active' => ['required', 'integer', 'in:0,1'],
            'avg_cost' => ['nullable', 'numeric', 'min:0'],
            'last_cost' => ['nullable', 'numeric', 'min:0'],
            'standard_bom_cost' => ['nullable', 'numeric', 'min:0'],
        ]);

        $data['avg_cost'] = $data['avg_cost'] ?? 0;
        $data['last_cost'] = $data['last_cost'] ?? 0;
        $data['standard_bom_cost'] = $data['standard_bom_cost'] ?? 0;

        $product->update($data);

        return back()->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return back()->with('success', 'Product deleted successfully.');
    }
}
