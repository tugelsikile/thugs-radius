<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddNasToCustomersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::connection("radius")->table('customers', function (Blueprint $table) {
            $table->uuid('nas')->after('profile');
            $table->foreign('nas')->on('nas')->references('id')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::connection("radius")->table('customers', function (Blueprint $table) {
            $table->dropForeign('customers_nas_foreign');
            $table->dropColumn('nas');
        });
    }
}
