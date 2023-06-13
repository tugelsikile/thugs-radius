<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNasIpAvailablesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::connection("radius")->create('nas_ip_availables', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique();
            $table->uuid('nas');
            $table->uuid('pool');
            $table->ipAddress('ip');
            $table->uuid('customer')->nullable();
            $table->timestamps();

            $table->foreign('nas')->on('nas')->references('id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('pool')->on('nas_profile_pools')->references('id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('customer')->on('customers')->references('id')->onDelete('set null')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::connection("radius")->dropIfExists('nas_ip_availables');
    }
}
