<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Diagnostic center login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $tenant = Tenant::where('email', $request->email)->first();

        if (! $tenant || ! Hash::check($request->password, $tenant->password)) {
            return response()->json(['message' => 'Invalid email or password.'], 401);
        }

        if ($tenant->status === 'pending') {
            return response()->json(['message' => 'Your account is awaiting activation. Please contact support.'], 403);
        }

        if ($tenant->status === 'suspended') {
            return response()->json(['message' => 'Your account has been suspended. Please contact support.'], 403);
        }

        if ($tenant->status === 'expired') {
            return response()->json(['message' => 'Your subscription has expired. Please renew your subscription.'], 403);
        }

        // Subscription window is driven by invoices: it ends when the current
        // period (first invoice date + paid months) is over.
        if ($tenant->status === 'active' && $tenant->subscription_ends_at && $tenant->subscription_ends_at->isPast()) {
            $tenant->update(['status' => 'expired']);

            return response()->json(['message' => 'Your subscription has expired. Please renew your subscription.'], 403);
        }

        // Check trial expiry
        if ($tenant->status === 'trial' && $tenant->trial_ends_at && $tenant->trial_ends_at->isPast()) {
            $tenant->update(['status' => 'expired']);

            return response()->json(['message' => 'Your trial has expired. Please contact support to activate.'], 403);
        }

        $token = Auth::guard('tenant')->login($tenant);

        return response()->json([
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'email' => $tenant->email,
                'status' => $tenant->status,
                'payment_status' => $tenant->payment_status,
                'trial_ends_at' => $tenant->trial_ends_at,
                'subscription_starts_at' => $tenant->subscription_starts_at,
                'subscription_ends_at' => $tenant->subscription_ends_at,
            ],
            'modules' => collect(config('modules.modules', []))
                ->filter(fn ($m) => in_array($m['slug'], $tenant->modules ?? [], true))
                ->values(),
        ]);
    }

    public function profile(Request $request)
    {
        $tenant = Auth::guard('tenant')->user();

        $subscribed = collect(config('modules.modules', []))
            ->filter(fn ($m) => in_array($m['slug'], $tenant->modules ?? [], true))
            ->values();

        return response()->json([
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'email' => $tenant->email,
                'status' => $tenant->status,
                'payment_status' => $tenant->payment_status,
                'trial_ends_at' => $tenant->trial_ends_at,
                'subscription_starts_at' => $tenant->subscription_starts_at,
                'subscription_ends_at' => $tenant->subscription_ends_at,
                'phone' => $tenant->phone,
                'address' => $tenant->address,
                'city' => $tenant->city,
            ],
            'modules' => $subscribed,
        ]);
    }

    public function logout()
    {
        Auth::guard('tenant')->logout();

        return response()->json(['message' => 'Logged out successfully.']);
    }
}
