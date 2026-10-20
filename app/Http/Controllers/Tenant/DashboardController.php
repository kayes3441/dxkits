<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $tenant = Auth::guard('tenant')->user();

        // Placeholder stats — will expand when diagnostic features are added
        $stats = [
            'tenant' => [
                'id'                   => $tenant->id,
                'name'                 => $tenant->name,
                'plan'                 => $tenant->plan,
                'status'               => $tenant->status,
                'trial_ends_at'        => $tenant->trial_ends_at,
                'subscription_ends_at' => $tenant->subscription_ends_at,
            ],
            'stats' => [
                'total_patients'   => 0,
                'total_tests'      => 0,
                'pending_reports'  => 0,
                'completed_today'  => 0,
            ],
        ];

        return response()->json($stats);
    }
}
