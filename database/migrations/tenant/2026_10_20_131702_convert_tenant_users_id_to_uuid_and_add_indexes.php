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
     * Indexes backing the tenant's most frequent user lookups.
     *
     * @var array<array<int, string>>
     */
    private array $indexes = [
        ['role'],
        ['is_active'],
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if ($this->hasColumns('users', 'id') && ! $this->isUuidColumn('users', 'id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('id', 36)->change();
            });

            foreach (DB::table('users')->orderBy('id')->pluck('id') as $previousId) {
                DB::table('users')->where('id', $previousId)->update(['id' => (string) Str::uuid7()]);
            }
        }

        $this->addIndexes();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $this->removeIndexes();

        if (! $this->hasColumns('users', 'id') || ! $this->isUuidColumn('users', 'id')) {
            return;
        }

        $sequence = 1;

        foreach (DB::table('users')->orderBy('created_at')->orderBy('id')->pluck('id') as $previousId) {
            DB::table('users')->where('id', $previousId)->update(['id' => $sequence++]);
        }

        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->autoIncrement()->change();
        });
    }

    /**
     * Add the indexes used by the application's queries.
     */
    private function addIndexes(): void
    {
        if (! Schema::hasTable('users')) {
            return;
        }

        foreach ($this->indexes as $columns) {
            $index = 'users_'.implode('_', $columns).'_index';

            if (Schema::hasIndex('users', $index)) {
                continue;
            }

            Schema::table('users', function (Blueprint $table) use ($columns, $index) {
                $table->index($columns, $index);
            });
        }
    }

    /**
     * Remove the indexes added by this migration.
     */
    private function removeIndexes(): void
    {
        if (! Schema::hasTable('users')) {
            return;
        }

        foreach ($this->indexes as $columns) {
            $index = 'users_'.implode('_', $columns).'_index';

            if (! Schema::hasIndex('users', $index)) {
                continue;
            }

            Schema::table('users', function (Blueprint $table) use ($index) {
                $table->dropIndex($index);
            });
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
