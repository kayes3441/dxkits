<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\SubscriptionLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DiagnosticController extends Controller
{
    /**
     * List all diagnostic centers
     */
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

        $tenants = $query->latest()->paginate(10);

        return response()->json($tenants);
    }

    /**
     * Create a new diagnostic center (auto-creates its database)
     */
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

        // Generate a slug-based tenant ID
        $tenantId = Str::slug($request->name) . '-' . Str::random(6);
        $tenantId = strtolower($tenantId);

        $trialEnds = Carbon::now()->addDays(30);

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
            'trial_ends_at'  => $trialEnds,
            'monthly_fee'    => $request->monthly_fee,
            'payment_status' => 'pending',
        ]);

        // Tenancy auto-creates the database and runs migrations via TenancyServiceProvider events

        return response()->json([
            'message' => 'Diagnostic center created successfully. Database provisioned.',
            'tenant' => $tenant,
        ], 201);
    }

    /**
     * Get a single diagnostic center
     */
    public function show(string $id)
    {
        $tenant = Tenant::findOrFail($id);

        $tenant->load('subscriptionLogs');

        return response()->json($tenant);
    }

    /**
     * Update diagnostic center info
     */
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

        $tenant->update($request->only([
            'name', 'phone', 'address', 'city', 'state', 'contact_person',
        ]));

        return response()->json([
            'message' => 'Diagnostic center updated.',
            'tenant' => $tenant->fresh(),
        ]);
    }

    /**
     * Delete a diagnostic center (drops its database too)
     */
    public function destroy(string $id)
    {
        $tenant = Tenant::findOrFail($id);
        $tenant->delete(); // TenancyServiceProvider handles DB deletion

        return response()->json(['message' => 'Diagnostic center deleted and database dropped.']);
    }

    /**
     * Stats for the dashboard
     */
    public function stats()
    {
        $stats = [
            'total'     => Tenant::count(),
            'active'    => Tenant::where('status', 'active')->count(),
            'trial'     => Tenant::where('status', 'trial')->count(),
            'suspended' => Tenant::where('status', 'suspended')->count(),
            'expired'   => Tenant::where('status', 'expired')->count(),
            'revenue'   => SubscriptionLog::where('action', 'renewed')->sum('amount'),
            'this_month_revenue' => SubscriptionLog::where('action', 'renewed')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('amount'),
        ];

        return response()->json($stats);
    }
}
