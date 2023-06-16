<?php /** @noinspection DuplicatedCode */

namespace App\Validations\Customer;

use App\Helpers\SwitchDB;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class InvoiceValidation
{
    public function __construct()
    {
        new SwitchDB();
    }

    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function payment(Request $request): Request
    {
        try {
            new SwitchDB();
            $valid = Validator::make($request->all(),[
                __('invoices.form_input.id') => 'required|exists:customer_invoices,id',
                __('invoices.payments.form_input.payment.input') => 'nullable',
                __('invoices.payments.form_input.payment.input') . '.*.' . __('invoices.payments.form_input.payment.id') => 'nullable|exists:customer_invoice_payments,id',
                __('invoices.payments.form_input.payment.input') . '.*.' . __('invoices.payments.form_input.payment.date') => 'required|dateFormat:Y-m-d H:i:s',
                __('invoices.payments.form_input.payment.input') . '.*.' . __('invoices.payments.form_input.payment.note') => 'required|string|min:5',
                __('invoices.payments.form_input.payment.input') . '.*.' . __('invoices.payments.form_input.payment.amount') => 'required|numeric|min:0',
                __('invoices.payments.form_input.payment.delete') => 'nullable',
                __('invoices.payments.form_input.payment.delete') . '.*' => 'required|exists:customer_invoice_payments,id',
                __('invoices.payments.form_input.total.payment') => 'required|numeric|min:0',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }

    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function update(Request $request): Request
    {
        try {
            new SwitchDB();
            $valid = Validator::make($request->all(),[
                __('invoices.form_input.id') => 'required|exists:customer_invoices,id',
                __('invoices.form_input.bill_period') => 'required|dateFormat:Y-m-d',
                __('customers.form_input.name') => 'required|exists:customers,id',
                __('invoices.form_input.note') => 'nullable',
                __('invoices.form_input.service.input') => 'required|array|min:1',
                __('invoices.form_input.service.input') . '.*.' .__('invoices.form_input.service.id') => 'nullable|exists:customer_invoice_services,id',
                __('invoices.form_input.service.input') . '.*.' .__('profiles.form_input.name') => 'nullable|exists:nas_profiles,id',
                __('invoices.form_input.service.delete') => 'nullable',
                __('invoices.form_input.service.delete') . '.*' => 'required|exists:customer_invoice_services,id',
                __('invoices.form_input.taxes.input') => 'nullable',
                __('invoices.form_input.taxes.input') . '.*.' . __('invoices.form_input.taxes.id') => 'nullable|exists:customer_invoice_taxes,id',
                __('invoices.form_input.service.taxes.delete') => 'nullable',
                __('invoices.form_input.service.taxes.delete') . '.*' => 'required|exists:customer_invoice_taxes,id',
                __('invoices.form_input.discounts.input') => 'nullable',
                __('invoices.form_input.discounts.input') . '.*.' . __('invoices.form_input.discounts.id') => 'nullable|exists:customer_invoice_discounts,id',
                __('invoices.form_input.discounts.delete') => 'nullable',
                __('invoices.form_input.discounts.delete') . '.*' => 'required|exists:customer_invoice_discounts,id',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            new SwitchDB("mysql");
            $valid = Validator::make($request->all(),[
                __('invoices.form_input.taxes.input') . '.*.' . __('taxes.form_input.name') => 'required|exists:taxes,id',
                __('invoices.form_input.discounts.input') . '.*.' . __('discounts.form_input.name') => 'required|exists:discounts,id',
                __('invoices.form_input.total') => 'required|numeric|min:0',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function create(Request $request): Request
    {
        try {
            new SwitchDB();
            $valid = Validator::make($request->all(),[
                __('invoices.form_input.bill_period') => 'required|dateFormat:Y-m-d',
                __('customers.form_input.name') => 'required|exists:customers,id',
                __('invoices.form_input.note') => 'nullable',
                __('invoices.form_input.service.input') => 'required|array|min:1',
                __('invoices.form_input.service.input') . '.*.' .__('invoices.form_input.service.id') => 'nullable|exists:customer_invoice_services,id',
                __('invoices.form_input.service.input') . '.*.' .__('profiles.form_input.name') => 'nullable|exists:nas_profiles,id',
                __('invoices.form_input.service.delete') => 'nullable',
                __('invoices.form_input.service.delete') . '.*' => 'required|exists:customer_invoice_services,id',
                __('invoices.form_input.taxes.input') => 'nullable',
                __('invoices.form_input.taxes.input') . '.*.' . __('invoices.form_input.taxes.id') => 'nullable|exists:customer_invoice_taxes,id',
                __('invoices.form_input.service.taxes.delete') => 'nullable',
                __('invoices.form_input.service.taxes.delete') . '.*' => 'required|exists:customer_invoice_taxes,id',
                __('invoices.form_input.discounts.input') => 'nullable',
                __('invoices.form_input.discounts.input') . '.*.' . __('invoices.form_input.discounts.id') => 'nullable|exists:customer_invoice_discounts,id',
                __('invoices.form_input.discounts.delete') => 'nullable',
                __('invoices.form_input.discounts.delete') . '.*' => 'required|exists:customer_invoice_discounts,id',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            new SwitchDB("mysql");
            $valid = Validator::make($request->all(),[
                __('invoices.form_input.taxes.input') . '.*.' . __('taxes.form_input.name') => 'required|exists:taxes,id',
                __('invoices.form_input.discounts.input') . '.*.' . __('discounts.form_input.name') => 'required|exists:discounts,id',
                __('invoices.form_input.total') => 'required|numeric|min:0',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function delete(Request $request): Request
    {
        try {
            new SwitchDB();
            $valid = Validator::make($request->all(),[
                __('invoices.form_input.id') => 'required|array|min:1',
                __('invoices.form_input.id') . '.*' => 'required|exists:customer_invoices,id'
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function generate(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                __('invoices.form_input.bill_period') => 'required|dateFormat:Y-m-d',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
