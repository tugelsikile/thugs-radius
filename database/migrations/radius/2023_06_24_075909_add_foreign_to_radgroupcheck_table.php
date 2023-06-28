<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddForeignToRadgroupcheckTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('nas_profiles', function (Blueprint $table) {
            $table->index('code');
        });
        Schema::table('radgroupcheck', function (Blueprint $table) {
            $table->foreign('groupname')->on('nas_profiles')->references('code')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('radgroupcheck', function (Blueprint $table) {
            $table->dropForeign('radgroupcheck_groupname_foreign');
        });
        Schema::table('nas_profiles', function (Blueprint $table) {
            $table->dropIndex('nas_profiles_code_index');
        });
    }
}
