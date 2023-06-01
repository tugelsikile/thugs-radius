<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAdditionalPackagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('additional_packages', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique();
            $table->uuid('company');
            $table->uuid('package');
            $table->string('paid_every_type')->default('months');
            $table->integer('paid_every_ammount')->default(0);
            $table->integer('paid_duration')->default(0);
            $table->boolean('otp')->default(false)->comment('one time payment');
            $table->timestamps();

            $table->foreign('company')->on('client_companies')->references('id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('package')->on('company_packages')->references('id')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('additional_packages');
    }
}
