<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCompanyDiscountsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('company_discounts', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique();
            $table->uuid('company');
            $table->uuid('discount');
            $table->timestamps();
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();

            $table->foreign('company')->on('client_companies')->references('id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('discount')->on('discounts')->references('id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('created_by')->on('users')->references('id')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('updated_by')->on('users')->references('id')->onDelete('set null')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('company_discounts');
    }
}
