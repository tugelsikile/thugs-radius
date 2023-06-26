<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddForHomeToCompanyPackagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('company_packages', function (Blueprint $table) {
            $table->boolean('for_homepage')->default(false)->after('is_additional');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('company_packages', function (Blueprint $table) {
            $table->dropColumn('for_homepage');
        });
    }
}
