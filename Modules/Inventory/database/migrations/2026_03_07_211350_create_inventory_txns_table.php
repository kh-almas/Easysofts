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
        Schema::create('inventory_txns', function (Blueprint $table) {
            $table->id();

            $table->foreignId('factory_id')
                ->constrained('factories')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->dateTime('txn_date');

            $table->enum('txn_type', [
                'PURCHASE_IN',
                'PRODUCTION_RAW_OUT',
                'FG_IN',
                'SHIPMENT_OUT',
                'DAMAGE_OUT',
                'ADJUSTMENT_IN',
                'ADJUSTMENT_OUT',
            ]);

            $table->foreignId('product_id')
                ->constrained('products')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->decimal('qty_in', 18, 6)->default(0);
            $table->decimal('qty_out', 18, 6)->default(0);

            $table->decimal('unit_cost', 18, 6)->default(0);
            $table->decimal('amount', 18, 6)->default(0);

            $table->enum('ref_table', [
                'purchases',
                'buyer_orders',
                'production_steps',
                'shipments',
                'manual',
            ])->default('manual');

            $table->unsignedBigInteger('ref_id')->nullable();

            $table->foreignId('buyer_order_id')
                ->nullable()
                ->constrained('buyer_orders')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->unsignedBigInteger('step_id')->nullable();

            $table->foreignId('purchase_id')
                ->nullable()
                ->constrained('purchases')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->unsignedBigInteger('shipment_id')->nullable();

            $table->text('note')->nullable();

            $table->foreignId('created_by')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->timestamps();

            $table->index(['factory_id', 'product_id']);
            $table->index(['factory_id', 'txn_type']);
            $table->index(['txn_date']);
            $table->index(['ref_table', 'ref_id']);
            $table->index(['buyer_order_id']);
            $table->index(['step_id']);
            $table->index(['purchase_id']);
            $table->index(['shipment_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_txns');
    }
};
