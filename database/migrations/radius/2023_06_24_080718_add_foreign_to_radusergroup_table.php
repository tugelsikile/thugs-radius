<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddForeignToRadusergroupTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('radusergroup', function (Blueprint $table) {
            $table->foreign('username')->on('customers')->references('nas_username')->onDelete('cascade')->onUpdate('cascade');
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
        Schema::table('radusergroup', function (Blueprint $table) {
            $table->dropForeign('radusergroup_groupname_foreign');
            $table->dropForeign('radusergroup_username_foreign');
        });
    }
}
