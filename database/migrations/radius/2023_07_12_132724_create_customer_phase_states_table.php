<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCustomerPhaseStatesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::connection('radius')->create('customer_phase_states', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique();
            $table->uuid('customer');
            $table->string('state',32)->nullable();
            $table->string('onu_index',64)->nullable();
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
        Schema::connection('radius')->dropIfExists('customer_phase_states');
    }
}
