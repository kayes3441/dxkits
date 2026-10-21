<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\SubscriptionLog;
use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function renew(Request $request, string $id)
    {
        $request->validate([
            'months' => 'required|integer|min:1|max:12',
            'amount' => 'required|numeric|min:0',
            'start_date' => 'nullable|date',
        ]);

        $tenant = Tenant::findOrFail($id);

        $start = $request->filled('start_date')
            ? Carbon::parse($request->start_date)
            : ($tenant->subscription_ends_at
                ? Carbon::parse($tenant->subscription_ends_at)
                : Carbon::now());

        $end = $start->copy()->addMonths($request->months);

        $total = $request->amount * $request->months;

        $tenant->update([
            'status' => 'active',
            'monthly_fee' => $request->amount,
            'subscription_starts_at' => $start,
            'subscription_ends_at' => $end,
            'payment_status' => 'pending',
        ]);

        // A subscription always generates its invoice for the period.
        $invoice = Invoice::create([
            'tenant_id' => $tenant->id,
            'amount' => $total,
            'status' => 'unpaid',
            'issued_at' => $start->toDateString(),
            'due_at' => $end->toDateString(),
            'notes' => $request->notes ?? "Subscription for {$request->months} month(s)",
        ]);

        SubscriptionLog::create([
            'tenant_id' => $tenant->id,
            'action' => 'renewed',
            'amount' => $total,
            'period_start' => $start,
            'period_end' => $end,
            'notes' => $request->notes ?? "Renewed for {$request->months} month(s)",
        ]);

        return response()->json([
            'message' => 'Subscription renewed and invoice generated.',
            'tenant' => $tenant->fresh(),
            'invoice' => $invoice,
        ]);
    }

    public function suspend(Request $request, string $id)
    {
        $tenant = Tenant::findOrFail($id);
        $tenant->update(['status' => 'suspended']);

        SubscriptionLog::create([
            'tenant_id' => $tenant->id,
            'action' => 'suspended',
            'amount' => 0,
            'period_start' => now(),
            'period_end' => now(),
            'notes' => $request->reason ?? 'Suspended by Admin',
        ]);

        return response()->json(['message' => 'Tenant suspended.', 'tenant' => $tenant->fresh()]);
    }

    public function activate(Request $request, string $id)
    {
        $tenant = Tenant::findOrFail($id);
        $tenant->update(['status' => 'active']);

        SubscriptionLog::create([
            'tenant_id' => $tenant->id,
            'action' => 'activated',
            'amount' => 0,
            'period_start' => now(),
            'period_end' => $tenant->subscription_ends_at ?? now(),
            'notes' => 'Reactivated by Admin',
        ]);

        return response()->json(['message' => 'Tenant activated.', 'tenant' => $tenant->fresh()]);
    }

    public function logs(string $id)
    {
        $tenant = Tenant::findOrFail($id);

        return response()->json($tenant->subscriptionLogs()->latest()->get());
    }

    public function updatePaymentStatus(Request $request, string $id)
    {
        $request->validate([
            'payment_status' => 'required|in:paid,pending,overdue',
        ]);

        $tenant = Tenant::findOrFail($id);
        $tenant->update(['payment_status' => $request->payment_status]);

        return response()->json(['message' => 'Payment status updated.', 'tenant' => $tenant->fresh()]);
    }
}
