<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCustomerTaxesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::connection("radius")->create('customer_taxes', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique();
            $table->uuid('customer');
            $table->uuid('tax');
            $table->timestamps();
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();

            $table->foreign('customer')->on('customers')->references('id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('tax')->on(config('database.connections.mysql.database').'.taxes')->references('id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('created_by')->on(config('database.connections.mysql.database').'.users')->references('id')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('updated_by')->on(config('database.connections.mysql.database').'.users')->references('id')->onDelete('set null')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::connection("radius")->dropIfExists('customer_taxes');
    }
}
