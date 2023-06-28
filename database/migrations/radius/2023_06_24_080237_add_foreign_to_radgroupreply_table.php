<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddForeignToRadgroupreplyTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('radgroupreply', function (Blueprint $table) {
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
        Schema::table('radgroupreply', function (Blueprint $table) {
            $table->dropForeign('radgroupreply_groupname_foreign');
        });
    }
}
