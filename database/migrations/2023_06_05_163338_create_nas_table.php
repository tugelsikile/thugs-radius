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
        Schema::create('nas', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique();
            $table->uuid('company');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('type',50)->default('other')->nullable();
            $table->string('community',100)->default('')->nullable();
            $table->string('method')->default('api')->comment('metode login ke router, bisa api atau ssl');
            $table->string('hostname')->nullable();
            $table->bigInteger('port')->default(8728);
            $table->bigInteger('auth_port')->default(7201);
            $table->bigInteger('acc_port')->default(7202);
            $table->string('user')->nullable();
            $table->string('password')->nullable();
            $table->string('secret')->nullable();
            $table->string('salt_hash')->nullable();
            $table->string('expire_url')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->uuid('deleted_by')->nullable();

            $table->foreign('company')->on('client_companies')->references('id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('created_by')->on('users')->references('id')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('updated_by')->on('users')->references('id')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('deleted_by')->on('users')->references('id')->onDelete('set null')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('nas');
    }
}
