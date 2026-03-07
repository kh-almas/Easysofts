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
        Schema::create('purchases', function (Blueprint $table) {
            $table->id();

            $table->foreignId('factory_id')
                ->constrained('factories')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->string('purchase_no');
            $table->string('supplier_name');
            $table->date('purchase_date');

            $table->foreignId('raw_product_id')
                ->constrained('products')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->decimal('qty', 18, 6);
            $table->decimal('unit_price', 18, 6);
            $table->decimal('total_amount', 18, 6);

            $table->decimal('other_cost', 18, 6)->default(0);
            $table->decimal('grand_total', 18, 6);

            $table->text('notes')->nullable();

            $table->foreignId('created_by')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->timestamps();

            $table->unique(['factory_id', 'purchase_no']);
            $table->index(['factory_id', 'purchase_date']);
            $table->index(['factory_id', 'raw_product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchases');
    }
};
