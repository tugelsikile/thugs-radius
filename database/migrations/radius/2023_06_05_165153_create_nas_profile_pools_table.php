<?php /** @noinspection DuplicatedCode */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNasProfilePoolsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::connection("radius")->create('nas_profile_pools', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique();
            $table->string('pool_id')->nullable();
            $table->uuid('nas');
            $table->string('name');
            $table->text('description')->nullable();
            $table->ipAddress('first_address')->nullable();
            $table->ipAddress('last_address')->nullable();
            $table->timestamps();
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();

            $table->foreign('nas')->on('nas')->references('id')->onDelete('cascade')->onUpdate('cascade');
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
        Schema::connection("radius")->dropIfExists('nas_profile_pools');
    }
}
