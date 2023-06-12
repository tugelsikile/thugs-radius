<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddActiveToCustomersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dateTime('active_at')->nullable()->after('updated_at');
            $table->dateTime('inactive_at')->nullable()->after('due_at');
            $table->uuid('active_by')->nullable()->after('updated_by');
            $table->uuid('inactive_by')->nullable();

            $table->foreign('active_by')->on(config('database.connections.mysql.database').'.users')->references('id')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('inactive_by')->on(config('database.connections.mysql.database').'.users')->references('id')->onDelete('set null')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropForeign('customers_inactive_by_foreign');
            $table->dropForeign('customers_active_by_foreign');
            $table->dropColumn('active_by');
            $table->dropColumn('inactive_by');
            $table->dropColumn('active_at');
            $table->dropColumn('inactive_at');
        });
    }
}
