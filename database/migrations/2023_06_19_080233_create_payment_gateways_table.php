<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePaymentGatewaysTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('payment_gateways', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique();
            $table->uuid('company')->nullable();
            $table->string('module')->default('duitku.com');
            $table->string('name');
            $table->text('description')->nullable();
            $table->text('keys')->nullable();
            $table->boolean('production')->default(false);
            $table->timestamps();
            $table->dateTime('active_at')->nullable();
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->uuid('active_by')->nullable();

            $table->foreign('company')->on('client_companies')->references('id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('created_by')->on('users')->references('id')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('updated_by')->on('users')->references('id')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('active_by')->on('users')->references('id')->onDelete('set null')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('payment_gateways');
    }
}
