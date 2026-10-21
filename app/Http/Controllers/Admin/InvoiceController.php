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

    public function store(Request $request, string $id)
    {
        $tenant = Tenant::findOrFail($id);

        $request->validate([
            'amount' => 'nullable|numeric|min:0',
            'due_at' => 'nullable|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $amount = $request->filled('amount') ? $request->amount : $tenant->monthly_fee;

        $invoice = Invoice::create([
            'tenant_id' => $tenant->id,
            'amount' => $amount,
            'status' => 'unpaid',
            'issued_at' => now()->toDateString(),
            'due_at' => $request->due_at ?? now()->addDays(15)->toDateString(),
            'notes' => $request->notes,
        ]);

        return response()->json(['message' => 'Invoice generated.', 'invoice' => $invoice], 201);
    }

    public function update(Request $request, string $id)
    {
        $invoice = Invoice::findOrFail($id);

        $request->validate([
            'status' => 'required|in:unpaid,paid,overdue',
        ]);

        $invoice->update(['status' => $request->status]);

        return response()->json(['message' => 'Invoice updated.', 'invoice' => $invoice->fresh()]);
    }
}
