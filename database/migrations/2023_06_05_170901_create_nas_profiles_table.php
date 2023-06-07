<?php /** @noinspection PhpUnused */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNasProfilesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('nas_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique();
            $table->string('profile_id')->nullable();
            $table->uuid('company');
            $table->uuid('nas')->nullable();
            $table->uuid('pool')->nullable();
            $table->uuid('bandwidth')->nullable();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('type',50)->default('pppoe')->comment('pppoe,hotspot, and or static');
            $table->ipAddress('local_address')->nullable();
            $table->text('dns_servers')->nullable();
            $table->integer('validity')->default(0);
            $table->string('validity_unit',50)->default('minutes');
            $table->integer('shared_users')->default(1);
            $table->double('price',20,2)->default(0);
            $table->boolean('is_additional')->default(false);
            $table->string('limit_type',50)->default('time')->comment('time or data');
            $table->bigInteger('limit_rate')->default(0);
            $table->string('limit_rate_unit')->nullable()->comment('data = mb, dll. time = minutes, dll.');
            $table->timestamps();
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();

            $table->foreign('company')->on('client_companies')->references('id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('nas')->on('nas')->references('id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('pool')->on('nas_profile_pools')->references('id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('bandwidth')->on('nas_profile_bandwidths')->references('id')->onDelete('set null')->onUpdate('set null');
            $table->foreign('created_by')->on('users')->references('id')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('updated_by')->on('users')->references('id')->onDelete('set null')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('nas_profiles');
    }
}
