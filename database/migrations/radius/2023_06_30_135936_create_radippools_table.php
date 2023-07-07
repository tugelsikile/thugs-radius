<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRadippoolsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('nas_profile_pools', function (Blueprint $table) {
            $table->index('code');
        });
        Schema::create('radippool', function (Blueprint $table) {
            $table->id();
            $table->string('pool_name',64);
            $table->ipAddress('framedipaddress')->default('');
            $table->ipAddress('nasipaddress')->default('');
            $table->macAddress('calledstationid')->default('');
            $table->macAddress('callingstationid')->default('');
            $table->dateTime('expiry_time')->nullable();
            $table->string('username',64)->nullable();
            $table->string('pool_key')->nullable();

            $table->foreign('pool_name')->on('nas_profile_pools')->references('code')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('username')->on('customers')->references('nas_username')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('radippool');
        Schema::table('nas_profile_pools', function (Blueprint $table) {
            $table->dropIndex('nas_profile_pools_code_index');
        });
    }
}
