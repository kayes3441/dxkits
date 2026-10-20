<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\SubscriptionLog;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SubscriptionController extends Controller
{
    public function renew(Request $request, string $id)
    {
        $request->validate([
            'months' => 'required|integer|min:1|max:12',
            'plan'   => 'required|in:basic,standard,premium',
            'amount' => 'required|numeric|min:0',
        ]);

        $tenant = Tenant::findOrFail($id);

        $start = $tenant->subscription_ends_at
            ? Carbon::parse($tenant->subscription_ends_at)
            : Carbon::now();

        $end = $start->copy()->addMonths($request->months);

        $tenant->update([
            'status'                 => 'active',
            'plan'                   => $request->plan,
            'monthly_fee'            => $request->amount,
            'subscription_starts_at' => $start,
            'subscription_ends_at'   => $end,
            'payment_status'         => 'paid',
        ]);

        SubscriptionLog::create([
            'tenant_id'    => $tenant->id,
            'action'       => 'renewed',
            'plan'         => $request->plan,
            'amount'       => $request->amount * $request->months,
            'period_start' => $start,
            'period_end'   => $end,
            'notes'        => $request->notes ?? "Renewed for {$request->months} month(s)",
        ]);

        return response()->json(['message' => 'Subscription renewed successfully.', 'tenant' => $tenant->fresh()]);
    }

    public function suspend(Request $request, string $id)
    {
        $tenant = Tenant::findOrFail($id);
        $tenant->update(['status' => 'suspended']);

        SubscriptionLog::create([
            'tenant_id'    => $tenant->id,
            'action'       => 'suspended',
            'plan'         => $tenant->plan,
            'amount'       => 0,
            'period_start' => now(),
            'period_end'   => now(),
            'notes'        => $request->reason ?? 'Suspended by Admin',
        ]);

        return response()->json(['message' => 'Tenant suspended.', 'tenant' => $tenant->fresh()]);
    }

    public function activate(Request $request, string $id)
    {
        $tenant = Tenant::findOrFail($id);
        $tenant->update(['status' => 'active']);

        SubscriptionLog::create([
            'tenant_id'    => $tenant->id,
            'action'       => 'activated',
            'plan'         => $tenant->plan,
            'amount'       => 0,
            'period_start' => now(),
            'period_end'   => $tenant->subscription_ends_at ?? now(),
            'notes'        => 'Reactivated by Admin',
        ]);

        return response()->json(['message' => 'Tenant activated.', 'tenant' => $tenant->fresh()]);
    }

    public function changePlan(Request $request, string $id)
    {
        $request->validate([
            'plan'        => 'required|in:basic,standard,premium',
            'monthly_fee' => 'required|numeric|min:0',
        ]);

        $tenant = Tenant::findOrFail($id);
        $oldPlan = $tenant->plan;

        $tenant->update(['plan' => $request->plan, 'monthly_fee' => $request->monthly_fee]);

        SubscriptionLog::create([
            'tenant_id'    => $tenant->id,
            'action'       => $request->plan > $oldPlan ? 'upgraded' : 'downgraded',
            'plan'         => $request->plan,
            'amount'       => 0,
            'period_start' => now(),
            'period_end'   => $tenant->subscription_ends_at ?? now(),
            'notes'        => "Plan changed from {$oldPlan} to {$request->plan}",
        ]);

        return response()->json(['message' => 'Plan updated.', 'tenant' => $tenant->fresh()]);
    }

    public function logs(string $id)
    {
        $tenant = Tenant::findOrFail($id);
        return response()->json($tenant->subscriptionLogs()->latest()->get());
    }
}
