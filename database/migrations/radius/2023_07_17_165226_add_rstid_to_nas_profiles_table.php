<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRstidToNasProfilesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('nas_profiles', function (Blueprint $table) {
            $table->bigInteger('system_id')->nullable()->after('profile_id')->comment("rstnet system");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('nas_profiles', function (Blueprint $table) {
            $table->dropColumn('system_id');
        });
    }
}
