<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCustomerTrafficTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::connection('radius')->create('customer_traffic', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique();
            $table->uuid('customer');
            $table->double('input',20,2)->default(0);
            $table->double('output',20,2)->default(0);
            $table->timestamps();
            $table->foreign('customer')->on('customers')->references('id')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::connection('radius')->dropIfExists('customer_traffic');
    }
}
