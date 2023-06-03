<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateClientCompaniesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('client_companies', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique();
            $table->uuid('currency');
            $table->uuid('package');
            $table->string('code')->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('domain')->nullable();
            $table->text('address')->nullable();
            $table->char('province',2)->nullable();
            $table->char('city',4)->nullable();
            $table->char('district',7)->nullable();
            $table->char('village',10)->nullable();
            $table->string('postal',7)->nullable();
            $table->string('phone',50)->nullable();
            $table->string('radius_db_host',150)->nullable();
            $table->string('radius_db_name',150)->nullable();
            $table->string('radius_db_user',100)->nullable();
            $table->string('radius_db_pass',100)->nullable();
            $table->timestamps();
            $table->dateTime('expired_at')->nullable();

            $table->foreign('package')->on('company_packages')->references('id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('province')->on(config('laravolt.indonesia.table_prefix').'provinces')->references('code')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('city')->on(config('laravolt.indonesia.table_prefix').'cities')->references('code')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('district')->on(config('laravolt.indonesia.table_prefix').'districts')->references('code')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('village')->on(config('laravolt.indonesia.table_prefix').'villages')->references('code')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('currency')->on('currencies')->references('id')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('client_companies');
    }
}
