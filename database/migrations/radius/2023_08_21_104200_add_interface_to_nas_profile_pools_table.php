<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddInterfaceToNasProfilePoolsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('nas_profile_pools', function (Blueprint $table) {
            $table->string('mikrotik_interface')->nullable()->after('code');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('nas_profile_pools', function (Blueprint $table) {
            $table->dropColumn('mikrotik_interface');
        });
    }
}
