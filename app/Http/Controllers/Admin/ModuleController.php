<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    protected function modules(): array
    {
        return config('modules.modules', []);
    }

    protected function priceFor(string $slug): float
    {
        foreach ($this->modules() as $m) {
            if ($m['slug'] === $slug) {
                return (float) ($m['price'] ?? 0);
            }
        }

        return 0;
    }

    public function index()
    {
        return response()->json($this->modules());
    }

    // List all modules with subscribed flag for a tenant
    public function tenantModules(string $id)
    {
        $tenant = Tenant::findOrFail($id);
        $selected = $tenant->modules ?? [];

        $data = array_map(function (array $m) use ($selected) {
            return [
                'slug' => $m['slug'],
                'name' => $m['name'],
                'description' => $m['description'] ?? null,
                'price' => (float) ($m['price'] ?? 0),
                'is_active' => (bool) ($m['is_active'] ?? true),
                'subscribed' => in_array($m['slug'], $selected, true),
            ];
        }, $this->modules());

        return response()->json($data);
    }

    // Sync modules for a tenant
    public function syncTenantModules(Request $request, string $id)
    {
        $tenant = Tenant::findOrFail($id);

        $request->validate([
            'modules' => 'array',
            'modules.*' => 'string',
        ]);

        $slugs = array_values(array_intersect(
            $request->input('modules', []),
            array_column($this->modules(), 'slug')
        ));

        $tenant->modules = array_values($slugs);

        $total = 0;
        foreach ($slugs as $slug) {
            $total += $this->priceFor($slug);
        }
        $tenant->monthly_fee = $total;
        $tenant->save();

        return response()->json(['message' => 'Modules updated.', 'monthly_fee' => (float) $total]);
    }
}
