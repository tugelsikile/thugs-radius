<?php /** @noinspection DuplicatedCode */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCompanyInvoicePaymentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('company_invoice_payments', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique();
            $table->string('code',50)->unique();
            $table->uuid('invoice');
            $table->double('paid_amount',20,2)->default(0);
            $table->text('note')->nullable();
            $table->longText('pg_response')->nullable();
            $table->double('pg_fee',20,2)->default(0);
            $table->timestamps();
            $table->softDeletes();
            $table->dateTime('paid_at')->nullable();
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->uuid('deleted_by')->nullable();
            $table->uuid('paid_by')->nullable();

            $table->foreign('invoice')->on('company_invoices')->references('id')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('created_by')->on('users')->references('id')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('updated_by')->on('users')->references('id')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('deleted_by')->on('users')->references('id')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('paid_by')->on('users')->references('id')->onDelete('set null')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('company_invoice_payments');
    }
}
