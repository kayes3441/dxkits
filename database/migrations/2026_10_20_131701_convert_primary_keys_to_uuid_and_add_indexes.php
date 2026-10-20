<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Tables whose auto-incrementing primary key is converted to a UUIDv7 string,
     * mapped to the columns in other tables that hold copies of that primary key.
     *
     * @var array<string, array<string, string>>
     */
    private array $uuidPrimaryKeys = [
        'users' => [
            'sessions' => 'user_id',
        ],
        'admins' => [],
        'subscription_logs' => [],
        'domains' => [],
    ];

    /**
     * Indexes backing the application's most frequent lookups and sorts.
     *
     * @var array<string, array<array<int, string>>>
     */
    private array $indexes = [
        'tenants' => [
            ['status'],
            ['created_at'],
            ['subscription_ends_at'],
        ],
        'subscription_logs' => [
            ['tenant_id', 'created_at'],
            ['action', 'created_at'],
        ],
        'tenant_user_impersonation_tokens' => [
            ['user_id'],
        ],
        'admins' => [
            ['role'],
            ['is_active'],
        ],
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $this->convertReferenceColumnsToUuid();
        $this->convertPrimaryKeysToUuid();
        $this->addIndexes();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $this->removeIndexes();
        $this->convertPrimaryKeysToInteger();
        $this->restoreReferenceColumns();
    }

    /**
     * Store UUIDs in the columns that reference the converted primary keys.
     */
    private function convertReferenceColumnsToUuid(): void
    {
        if ($this->hasColumns('sessions', 'user_id') && ! $this->isUuidColumn('sessions', 'user_id')) {
            Schema::table('sessions', function (Blueprint $table) {
                $table->string('user_id', 36)->nullable()->change();
            });
        }

        if ($this->hasColumns('tenant_user_impersonation_tokens', 'user_id') && ! $this->isUuidColumn('tenant_user_impersonation_tokens', 'user_id')) {
            Schema::table('tenant_user_impersonation_tokens', function (Blueprint $table) {
                $table->string('user_id', 36)->change();
            });
        }
    }

    /**
     * Convert the primary keys to UUIDv7 strings and update every column referencing them.
     */
    private function convertPrimaryKeysToUuid(): void
    {
        foreach ($this->uuidPrimaryKeys as $table => $referenceColumns) {
            if (! $this->hasColumns($table, 'id') || $this->isUuidColumn($table, 'id')) {
                continue;
            }

            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->string('id', 36)->change();
            });

            foreach (DB::table($table)->orderBy('id')->pluck('id') as $previousId) {
                $uuid = (string) Str::uuid7();

                DB::table($table)->where('id', $previousId)->update(['id' => $uuid]);

                foreach ($referenceColumns as $referenceTable => $referenceColumn) {
                    DB::table($referenceTable)->where($referenceColumn, $previousId)->update([$referenceColumn => $uuid]);
                }
            }
        }
    }

    /**
     * Restore auto-incrementing integer primary keys and remap the referencing columns.
     */
    private function convertPrimaryKeysToInteger(): void
    {
        foreach (array_reverse($this->uuidPrimaryKeys, true) as $table => $referenceColumns) {
            if (! $this->hasColumns($table, 'id') || ! $this->isUuidColumn($table, 'id')) {
                continue;
            }

            $sequence = 1;

            foreach (DB::table($table)->orderBy('created_at')->orderBy('id')->pluck('id') as $previousId) {
                $integerId = $sequence++;

                DB::table($table)->where('id', $previousId)->update(['id' => $integerId]);

                foreach ($referenceColumns as $referenceTable => $referenceColumn) {
                    DB::table($referenceTable)->where($referenceColumn, $previousId)->update([$referenceColumn => $integerId]);
                }
            }

            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->unsignedBigInteger('id')->autoIncrement()->change();
            });
        }
    }

    /**
     * Restore the original column definitions of the referencing columns.
     */
    private function restoreReferenceColumns(): void
    {
        if ($this->hasColumns('sessions', 'user_id')) {
            Schema::table('sessions', function (Blueprint $table) {
                $table->unsignedBigInteger('user_id')->nullable()->change();
            });
        }

        if ($this->hasColumns('tenant_user_impersonation_tokens', 'user_id')) {
            Schema::table('tenant_user_impersonation_tokens', function (Blueprint $table) {
                $table->string('user_id')->change();
            });
        }
    }

    /**
     * Add the indexes used by the application's queries.
     */
    private function addIndexes(): void
    {
        foreach ($this->indexes as $table => $indexColumns) {
            if (! Schema::hasTable($table)) {
                continue;
            }

            foreach ($indexColumns as $columns) {
                $index = $table.'_'.implode('_', $columns).'_index';

                if (Schema::hasIndex($table, $index)) {
                    continue;
                }

                Schema::table($table, function (Blueprint $blueprint) use ($columns, $index) {
                    $blueprint->index($columns, $index);
                });
            }
        }
    }

    /**
     * Remove the indexes added by this migration.
     */
    private function removeIndexes(): void
    {
        foreach ($this->indexes as $table => $indexColumns) {
            if (! Schema::hasTable($table)) {
                continue;
            }

            foreach ($indexColumns as $columns) {
                $index = $table.'_'.implode('_', $columns).'_index';

                if (! Schema::hasIndex($table, $index)) {
                    continue;
                }

                Schema::table($table, function (Blueprint $blueprint) use ($index) {
                    $blueprint->dropIndex($index);
                });
            }
        }
    }

    /**
     * Determine whether the table exists and contains the given column.
     */
    private function hasColumns(string $table, string $column): bool
    {
        return Schema::hasTable($table) && Schema::hasColumn($table, $column);
    }

    /**
     * Determine whether the column already stores UUID strings.
     */
    private function isUuidColumn(string $table, string $column): bool
    {
        return Str::contains(Schema::getColumnType($table, $column), ['char', 'string']);
    }
};
