<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddForeignToRadcheckTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->index('nas_username');
        });
        Schema::table('radcheck', function (Blueprint $table) {
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
        Schema::table('radcheck', function (Blueprint $table) {
            $table->dropForeign('radcheck_username_foreign');
        });
        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex('customers_nas_username_index');
        });
    }
}
