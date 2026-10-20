<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create SuperAdmin
        User::firstOrCreate(
            ['email' => 'superadmin@lis.com'],
            [
                'name' => 'Super Admin',
                'email' => 'superadmin@lis.com',
                'password' => Hash::make('superadmin123'),
                'role' => 'superadmin',
            ]
        );

        $this->command->info('SuperAdmin created: superadmin@lis.com / superadmin123');
    }
}
