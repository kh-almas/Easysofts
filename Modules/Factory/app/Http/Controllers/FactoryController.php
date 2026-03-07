<?php

namespace Modules\Factory\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Modules\Factory\Models\Factory;

class FactoryController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->string('q')->toString();

        $factories = Factory::query()
            ->when($q, function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('code', 'like', "%{$q}%");
            })
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('modules/factories/Index', [
            'factories' => $factories,
            'filters' => [
                'q' => $q,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'code' => ['required','string','max:255','unique:factories,code'],
            'address' => ['nullable','string'],
            'status' => ['required','integer','in:0,1'],
        ]);

        Factory::create($data);

        return back()->with('success', 'Factory created successfully.');
    }

    public function update(Request $request, Factory $factory)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'code' => [
                'required','string','max:255',
                Rule::unique('factories', 'code')->ignore($factory->id),
            ],
            'address' => ['nullable','string'],
            'status' => ['required','integer','in:0,1'],
        ]);

        $factory->update($data);

        return back()->with('success', 'Factory updated successfully.');
    }

    public function destroy(Factory $factory)
    {
        $factory->delete();

        return back()->with('success', 'Factory deleted successfully.');
    }
}
