<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class FreeradiusV3Update extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("radacct", function (Blueprint $table) {
            $table->string('framedipv6address',64)->default('');
            $table->string('framedipv6prefix',64)->default('');
            $table->string('framedinterfaceid',64)->default('');
            $table->string('delegatedipv6prefix',64)->default('');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table("radacct", function (Blueprint $table) {
            $table->dropColumn([
                'framedipv6address',
                'framedipv6prefix',
                'framedinterfaceid',
                'delegatedipv6prefix'
            ]);
        });
    }
}
