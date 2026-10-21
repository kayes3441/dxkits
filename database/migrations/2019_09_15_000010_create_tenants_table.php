<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTenantsTable extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('logo')->nullable();
            $table->string('contact_person')->nullable();

            $table->enum('status', ['pending', 'active', 'suspended', 'trial', 'expired'])->default('pending');
            $table->date('trial_ends_at')->nullable();
            $table->date('subscription_starts_at')->nullable();
            $table->date('subscription_ends_at')->nullable();
            $table->decimal('monthly_fee', 10, 2)->default(0);
            $table->string('payment_status')->default('pending');

            $table->timestamps();
            $table->softDeletes();
            $table->json('data')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
}
