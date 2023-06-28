<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePaymentGatewayTokensTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('payment_gateway_tokens', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique();
            $table->uuid('gateway');
            $table->uuid('company')->nullable();
            $table->string('token')->nullable();
            $table->text('params')->nullable();
            $table->timestamps();
            $table->dateTime('expired_at')->nullable();

            $table->foreign('gateway')->on('payment_gateways')->references('id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('company')->on('client_companies')->references('id')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('payment_gateway_tokens');
    }
}
