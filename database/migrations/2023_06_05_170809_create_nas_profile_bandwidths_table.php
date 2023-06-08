<?php /** @noinspection DuplicatedCode */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNasProfileBandwidthsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('nas_profile_bandwidths', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique();
            $table->uuid('company');
            $table->string('name');
            $table->text('description')->nullable();
            $table->bigInteger('max_limit_up')->default(0);
            $table->bigInteger('max_limit_down')->default(0);

            $table->bigInteger('burst_limit_up')->default(0);
            $table->bigInteger('burst_limit_down')->default(0);

            $table->bigInteger('threshold_up')->default(0);
            $table->bigInteger('threshold_down')->default(0);

            $table->bigInteger('burst_time_up')->default(0);
            $table->bigInteger('burst_time_down')->default(0);

            $table->bigInteger('limit_at_up')->default(0);
            $table->bigInteger('limit_at_down')->default(0);

            $table->tinyInteger('priority')->default(8);

            $table->timestamps();
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();

            $table->foreign('company')->on('client_companies')->references('id')->onDelete('cascade')->onUpdate('cascade');
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
        Schema::dropIfExists('nas_profile_bandwidths');
    }
}
