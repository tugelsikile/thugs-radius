<?php /** @noinspection DuplicatedCode */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePettyCashesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('petty_cashes', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique();
            $table->string('type',20)->default('input');
            $table->dateTime('period');
            $table->string('name');
            $table->text('description')->nullable();
            $table->double('amount',20,3)->default(0);
            $table->boolean('has_approval')->default(true);
            $table->longText('remarks')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->dateTime('approved_at')->nullable();
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->uuid('deleted_by')->nullable();
            $table->uuid('approved_by')->nullable();

            $table->foreign('created_by')->on(config('database.connections.mysql.database').'.users')->references('id')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('updated_by')->on(config('database.connections.mysql.database').'.users')->references('id')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('deleted_by')->on(config('database.connections.mysql.database').'.users')->references('id')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('approved_by')->on(config('database.connections.mysql.database').'.users')->references('id')->onDelete('set null')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('petty_cashes');
    }
}
