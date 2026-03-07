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
        Schema::create('buyer_orders', function (Blueprint $table) {
            $table->id();

            $table->foreignId('factory_id')
                ->constrained('factories')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->string('buyer_name');
            $table->string('buyer_order_no');
            $table->date('order_date');
            $table->date('delivery_date')->nullable();

            $table->foreignId('fg_product_id')
                ->constrained('products')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->decimal('order_qty', 18, 6);

            $table->date('planned_start_date')->nullable();
            $table->date('planned_end_date')->nullable();

            $table->enum('status', [
                'draft',
                'confirmed',
                'in_production',
                'ready',
                'shipped',
                'cancelled',
            ])->default('draft');

            $table->decimal('produced_qty', 18, 6)->default(0);
            $table->decimal('shipped_qty', 18, 6)->default(0);

            $table->foreignId('created_by')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->timestamps();

            $table->unique(['factory_id', 'buyer_order_no']);
            $table->index(['factory_id', 'status']);
            $table->index(['factory_id', 'fg_product_id']);
            $table->index('order_date');
            $table->index('delivery_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('buyer_orders');
    }
};
