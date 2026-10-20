<?php

namespace App\Models;

use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Tenant extends BaseTenant implements TenantWithDatabase, JWTSubject
{
    use HasDatabase, HasDomains;

    protected $fillable = [
        'id',
        'name',
        'email',
        'password',
        'phone',
        'address',
        'city',
        'state',
        'logo',
        'contact_person',
        'plan',
        'status',
        'trial_ends_at',
        'subscription_starts_at',
        'subscription_ends_at',
        'monthly_fee',
        'payment_status',
        'data',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'data' => 'array',
        'trial_ends_at' => 'date',
        'subscription_starts_at' => 'date',
        'subscription_ends_at' => 'date',
        'monthly_fee' => 'decimal:2',
    ];

    public static function getCustomColumns(): array
    {
        return [
            'id',
            'name',
            'email',
            'password',
            'phone',
            'address',
            'city',
            'state',
            'logo',
            'contact_person',
            'plan',
            'status',
            'trial_ends_at',
            'subscription_starts_at',
            'subscription_ends_at',
            'monthly_fee',
            'payment_status',
        ];
    }

    // JWT
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [
            'guard' => 'tenant',
            'tenant_id' => $this->id,
            'name' => $this->name,
        ];
    }

    public function subscriptionLogs()
    {
        return $this->hasMany(SubscriptionLog::class, 'tenant_id');
    }

    public function getStatusBadgeAttribute(): string
    {
        return match($this->status) {
            'active' => 'Active',
            'suspended' => 'Suspended',
            'trial' => 'Trial',
            'expired' => 'Expired',
            default => 'Unknown',
        };
    }
}
