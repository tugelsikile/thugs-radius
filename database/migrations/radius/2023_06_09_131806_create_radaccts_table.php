<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRadacctsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::connection("radius")->create('radacct', function (Blueprint $table) {
            $table->id('radacctid');
            $table->string('acctsessionid',64);
            $table->string('acctuniqueid',32);
            $table->string('username',64);
            $table->string('groupname',64);
            $table->string('realm',64)->nullable();
            $table->ipAddress('nasipaddress');
            $table->string('nasportid',15)->nullable();
            $table->string('nasporttype',32)->nullable();
            $table->dateTime('acctstarttime')->nullable();
            $table->dateTime('acctupdatetime')->nullable();
            $table->dateTime('acctstoptime')->nullable();
            $table->integer('acctinterval')->nullable();
            $table->integer('acctsessiontime')->nullable();
            $table->string('acctauthentic',32)->nullable();
            $table->string('connectinfo_start')->nullable();
            $table->string('connectinfo_stop')->nullable();
            $table->bigInteger('acctinputoctets')->nullable();
            $table->bigInteger('acctoutputoctets')->nullable();
            $table->string('calledstationid');
            $table->macAddress('callingstationid');
            $table->string('acctterminatecause');
            $table->string('servicetype')->nullable();
            $table->string('framedprotocol',50)->nullable();
            $table->ipAddress('framedipaddress');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::connection("radius")->dropIfExists('radacct');
    }
}
