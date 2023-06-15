<?php /** @noinspection DuplicatedCode */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCustomerInvoiceTaxesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('customer_invoice_taxes', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique();
            $table->uuid('invoice');
            $table->uuid('tax');
            $table->timestamps();
            $table->softDeletes();
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->uuid('deleted_by')->nullable();

            $table->foreign('invoice')->on('customer_invoices')->references('id')->onDelete('cascade');
            $table->foreign('tax')->on(config('database.connections.mysql.database').'.taxes')->references('id')->onDelete('cascade');
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
        Schema::dropIfExists('customer_invoice_taxes');
    }
}
