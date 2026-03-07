<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();

            $table->foreignId('factory_id')
                ->constrained('factories')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->enum('type', ['RAW', 'FG']);
            $table->string('sku', 255);
            $table->string('name', 255);
            $table->string('uom', 20);
            $table->tinyInteger('is_active')->default(1);

            $table->decimal('avg_cost', 18, 6)->default(0);
            $table->decimal('last_cost', 18, 6)->default(0);
            $table->decimal('standard_bom_cost', 18, 6)->default(0);

            $table->timestamps();

            $table->unique(['factory_id', 'sku']);
            $table->index(['factory_id', 'type']);
            $table->index(['factory_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
