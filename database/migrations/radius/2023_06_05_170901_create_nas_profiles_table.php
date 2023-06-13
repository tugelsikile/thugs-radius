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
        Schema::connection("radius")->create('nas_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique();
            $table->string('profile_id')->nullable();
            $table->uuid('nas')->nullable();
            $table->uuid('pool')->nullable();
            $table->uuid('bandwidth')->nullable();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('type',50)->comment('pppoe,hotspot, and or static')->nullable();
            $table->ipAddress('local_address')->nullable();
            $table->text('dns_servers')->nullable();
            $table->integer('shared_users')->nullable();
            $table->double('price',20,2)->default(0);
            $table->boolean('is_additional')->default(false);
            $table->string('limit_type',50)->comment('time or data')->nullable();
            $table->bigInteger('limit_rate')->default(0);
            $table->string('limit_rate_unit')->nullable()->comment('data = mb, dll. time = minutes, dll.');
            $table->text('parent_queue')->nullable();
            $table->timestamps();
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();

            $table->foreign('nas')->on('nas')->references('id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('pool')->on('nas_profile_pools')->references('id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('bandwidth')->on('nas_profile_bandwidths')->references('id')->onDelete('set null')->onUpdate('set null');
            $table->foreign('created_by')->on(config('database.connections.mysql.database').'.users')->references('id')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('updated_by')->on(config('database.connections.mysql.database').'.users')->references('id')->onDelete('set null')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::connection("radius")->dropIfExists('nas_profiles');
    }
}
