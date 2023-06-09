<?php /** @noinspection PhpUnused */

/** @noinspection DuplicatedCode */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCustomersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::connection("radius")->create('customers', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique();
            $table->uuid('profile');
            $table->uuid('user');
            $table->string('code',50)->comment('unique berdasarkan company');
            $table->text('address')->nullable();
            $table->char('province',2)->nullable();
            $table->char('city',4)->nullable();
            $table->char('district',7)->nullable();
            $table->char('village',10)->nullable();
            $table->string('postal',10)->nullable();
            $table->string('phone')->nullable();
            $table->string('nas_username')->comment('unique berdasarkan nas');
            $table->string('nas_password')->nullable();
            $table->timestamps();
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();

            $table->foreign('profile')->on('nas_profiles')->references('id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('user')->on(config('database.connections.mysql.database').'.users')->references('id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('province')->on(config('database.connections.mysql.database') . '.' . config('laravolt.indonesia.table_prefix').'provinces')->references('code')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('city')->on(config('database.connections.mysql.database') . '.' . config('laravolt.indonesia.table_prefix').'cities')->references('code')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('district')->on(config('database.connections.mysql.database') . '.' . config('laravolt.indonesia.table_prefix').'districts')->references('code')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('village')->on(config('database.connections.mysql.database') . '.' . config('laravolt.indonesia.table_prefix').'villages')->references('code')->onDelete('set null')->onUpdate('cascade');
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
        Schema::connection("radius")->dropIfExists('customers');
    }
}
