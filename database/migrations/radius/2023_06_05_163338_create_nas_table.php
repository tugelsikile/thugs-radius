<?php /** @noinspection DuplicatedCode */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::connection("radius")->create('nas', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique();
            $table->string('nasname',128)->comment('name');
            $table->string('shortname',50)->nullable();
            $table->string('type',32)->nullable();
            $table->integer('ports')->nullable();
            $table->string('secret',60);
            $table->string('server',64)->nullable();
            $table->string('community',100)->default('')->nullable();

            $table->text('description')->nullable();
            $table->string('method')->default('api')->comment('metode login ke router, bisa api atau ssl');
            $table->string('method_domain')->nullable();
            $table->bigInteger('method_port')->default(8728);
            $table->bigInteger('auth_port')->default(7201);
            $table->bigInteger('acc_port')->default(7202);
            $table->string('user')->nullable();
            $table->string('password')->nullable();
            $table->string('expire_url')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->uuid('deleted_by')->nullable();

            $table->foreign('created_by')->on(config('database.connections.mysql.database').'.users')->references('id')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('updated_by')->on(config('database.connections.mysql.database').'.users')->references('id')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('deleted_by')->on(config('database.connections.mysql.database').'.users')->references('id')->onDelete('set null')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::connection("radius")->dropIfExists('nas');
    }
}
