<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCompanyPackagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('company_packages', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique();
            $table->string('code')->unique();
            $table->integer('order')->default(0);
            $table->string('name');
            $table->text('description')->nullable();
            $table->double('base_price',20,2)->default(0);
            $table->double('vat_percent',20,2)->default(0);
            $table->string('duration_string',30)->default('days');
            $table->integer('duration_ammount')->default(0);
            $table->integer('max_users')->default(0);
            $table->integer('max_customers')->default(0);
            $table->integer('max_vouchers')->default(0);
            $table->integer('max_routerboards')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('company_packages');
    }
}
