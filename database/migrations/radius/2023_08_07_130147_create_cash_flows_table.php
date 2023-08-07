<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCashFlowsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cash_flows', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique();
            $table->string('code',50)->unique();
            $table->uuid('account');
            $table->uuid('category');
            $table->text('description');
            $table->string('type',10)->default('debit')->comment('debit or credit');
            $table->double('amount',20,3)->default(0);
            $table->timestamps();
            $table->dateTime('period');
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();

            $table->foreign('account')->on('accounts')->references('id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('category')->on('categories')->references('id')->onDelete('cascade')->onUpdate('cascade');
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
        Schema::dropIfExists('cash_flows');
    }
}
