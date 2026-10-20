<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\SubscriptionLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DiagnosticController extends Controller
{
    public function index(Request $request)
    {
        $query = Tenant::query();

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
            });
        }

        return response()->json($query->latest()->paginate(10));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'           => 'required|string|max:255',
            'email'          => 'required|email|unique:tenants,email',
            'password'       => 'required|string|min:8',
            'phone'          => 'nullable|string|max:20',
            'address'        => 'nullable|string|max:500',
            'city'           => 'nullable|string|max:100',
            'state'          => 'nullable|string|max:100',
            'contact_person' => 'nullable|string|max:255',
            'plan'           => 'required|in:basic,standard,premium',
            'monthly_fee'    => 'required|numeric|min:0',
        ]);

        $tenantId = strtolower(Str::slug($request->name) . '-' . Str::random(6));

        $tenant = Tenant::create([
            'id'             => $tenantId,
            'name'           => $request->name,
            'email'          => $request->email,
            'password'       => Hash::make($request->password),
            'phone'          => $request->phone,
            'address'        => $request->address,
            'city'           => $request->city,
            'state'          => $request->state,
            'contact_person' => $request->contact_person,
            'plan'           => $request->plan,
            'status'         => 'trial',
            'trial_ends_at'  => Carbon::now()->addDays(30),
            'monthly_fee'    => $request->monthly_fee,
            'payment_status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Diagnostic center created successfully. Database provisioned.',
            'tenant'  => $tenant,
        ], 201);
    }

    public function show(string $id)
    {
        $tenant = Tenant::with('subscriptionLogs')->findOrFail($id);
        return response()->json($tenant);
    }

    public function update(Request $request, string $id)
    {
        $tenant = Tenant::findOrFail($id);

        $request->validate([
            'name'           => 'sometimes|string|max:255',
            'phone'          => 'nullable|string|max:20',
            'address'        => 'nullable|string|max:500',
            'city'           => 'nullable|string|max:100',
            'state'          => 'nullable|string|max:100',
            'contact_person' => 'nullable|string|max:255',
        ]);

        $tenant->update($request->only(['name', 'phone', 'address', 'city', 'state', 'contact_person']));

        return response()->json(['message' => 'Diagnostic center updated.', 'tenant' => $tenant->fresh()]);
    }

    public function destroy(string $id)
    {
        Tenant::findOrFail($id)->delete();
        return response()->json(['message' => 'Diagnostic center deleted and database dropped.']);
    }

    public function stats()
    {
        return response()->json([
            'total'              => Tenant::count(),
            'active'             => Tenant::where('status', 'active')->count(),
            'trial'              => Tenant::where('status', 'trial')->count(),
            'suspended'          => Tenant::where('status', 'suspended')->count(),
            'expired'            => Tenant::where('status', 'expired')->count(),
            'revenue'            => SubscriptionLog::where('action', 'renewed')->sum('amount'),
            'this_month_revenue' => SubscriptionLog::where('action', 'renewed')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('amount'),
        ]);
    }
}
