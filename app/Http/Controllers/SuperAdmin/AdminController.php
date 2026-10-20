<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function index()
    {
        $admins = Admin::latest()->get();

        return response()->json($admins);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:admins,email',
            'password' => 'required|string|min:8',
            'role'     => 'nullable|in:admin,superadmin',
            'is_active' => 'nullable|boolean',
        ]);

        $admin = Admin::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'role'      => $request->role ?? 'admin',
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json([
            'message' => 'Admin created successfully.',
            'admin'   => $admin,
        ], 201);
    }

    public function show(string $id)
    {
        $admin = Admin::findOrFail($id);

        return response()->json($admin);
    }

    public function update(Request $request, string $id)
    {
        $admin = Admin::findOrFail($id);

        $request->validate([
            'name'      => 'sometimes|string|max:255',
            'email'     => 'sometimes|email|unique:admins,email,' . $id,
            'password'  => 'sometimes|string|min:8',
            'role'      => 'sometimes|in:admin,superadmin',
            'is_active' => 'sometimes|boolean',
        ]);

        $data = $request->only(['name', 'email', 'role', 'is_active']);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $admin->update($data);

        return response()->json([
            'message' => 'Admin updated successfully.',
            'admin'   => $admin->fresh(),
        ]);
    }

    public function destroy(string $id)
    {
        $admin = Admin::findOrFail($id);
        $admin->delete();

        return response()->json(['message' => 'Admin deleted successfully.']);
    }
}
