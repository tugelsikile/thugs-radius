<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddActiveToClientCompaniesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('client_companies', function (Blueprint $table) {
            $table->dateTime('active_at')->nullable()->after('expired_at');
            $table->uuid('active_by')->after('radius_db_pass')->nullable();

            $table->foreign('active_by')->on('users')->references('id')->onDelete('set null')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('client_companies', function (Blueprint $table) {
            $table->dropForeign('client_companies_active_by_foreign');
            $table->dropColumn('active_at');
            $table->dropColumn('active_by');
        });
    }
}
