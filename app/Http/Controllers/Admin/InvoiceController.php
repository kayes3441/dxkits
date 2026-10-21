<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Tenant;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index(string $id)
    {
        $tenant = Tenant::findOrFail($id);

        return response()->json($tenant->invoices()->latest()->get());
    }

    public function update(Request $request, string $id)
    {
        $invoice = Invoice::findOrFail($id);

        $request->validate([
            'status' => 'required|in:unpaid,paid,overdue',
        ]);

        $invoice->update(['status' => $request->status]);

        // Keep the lab payment status in sync with its latest invoice.
        $tenant = $invoice->tenant;
        if ($tenant) {
            $paymentStatus = match ($invoice->status) {
                'paid' => 'paid',
                'overdue' => 'overdue',
                default => 'pending',
            };
            $tenant->update(['payment_status' => $paymentStatus]);
        }

        return response()->json(['message' => 'Invoice updated.', 'invoice' => $invoice->fresh()]);
    }
}
