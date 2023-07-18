<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddSystemIdToNasProfilePoolsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('nas_profile_pools', function (Blueprint $table) {
            $table->bigInteger('system_id')->nullable()->after('pool_id');
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
            $table->dropColumn('system_id');
        });
    }
}
