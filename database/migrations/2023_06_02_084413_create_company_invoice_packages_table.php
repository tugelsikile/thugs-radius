<?php /** @noinspection ALL */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCompanyInvoicePackagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('company_invoice_packages', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique();
            $table->uuid('invoice');
            $table->uuid('package')->nullable();
            $table->string('package_name');
            $table->text('package_description')->nullable();
            $table->text('user_note')->nullable();
            $table->double('price',20,2)->default(0);
            $table->double('vat',20,2)->default(0);
            $table->double('discount',20,2)->default(0);
            $table->integer('qty')->default(0);
            $table->timestamps();
            $table->softDeletes();
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->uuid('deleted_by')->nullable();

            $table->foreign('package')->on('company_packages')->references('id')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('invoice')->on('company_invoices')->references('id')->onDelete('cascade')->onUpdate('cascade');
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
        Schema::dropIfExists('company_invoice_packages');
    }
}
