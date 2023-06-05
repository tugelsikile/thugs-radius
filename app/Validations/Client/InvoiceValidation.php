<?php

namespace App\Validations\Client;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class InvoiceValidation
{
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function generate(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                'id' => 'required|dateFormat:Y-m-d'
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
    public function payment(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                __('companies.invoices.form_input.name') => 'required|exists:company_invoices,id',
                __('companies.invoices.payments.form_input.name') => 'nullable',
                __('companies.invoices.payments.form_input.name') . '.*.' . __('companies.invoices.payments.form_input.id') => 'nullable|exists:company_invoice_payments,id',
                __('companies.invoices.payments.form_input.name') . '.*.' . __('companies.invoices.payments.form_input.date') => 'required|dateFormat:Y-m-d H:i:s',
                __('companies.invoices.payments.form_input.name') . '.*.' . __('companies.invoices.payments.form_input.note') => 'required|string|min:3|max:199',
                __('companies.invoices.payments.form_input.name') . '.*.' . __('companies.invoices.payments.form_input.amount') => 'required|numeric|min:0',
                __('companies.invoices.payments.form_input.max_amount') => 'required|numeric|min:0',
                __('companies.invoices.payments.form_input.delete') => 'nullable',
                __('companies.invoices.payments.form_input.delete') . '.*' => 'required|exists:company_invoice_payments,id',
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
            $valid = Validator::make($request->all(),[
                'id' => 'required|array|min:1',
                'id.*' => 'required|exists:company_invoices,id',
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
            $valid = Validator::make($request->all(),[
                __('companies.invoices.form_input.id') => 'required|exists:company_invoices,id',
                __('companies.form_input.name') => 'required|exists:client_companies,id',
                __('companies.invoices.form_input.periode') => 'required|dateFormat:Y-m-d',
                __('companies.invoices.form_input.package.input') => 'required|array|min:1',
                __('companies.invoices.form_input.package.input') . '.*.'. __('companies.invoices.form_input.package.id') => 'nullable|exists:company_invoice_packages,id',
                __('companies.invoices.form_input.package.input') . '.*.'. __('companies.invoices.form_input.package.name') => 'required|exists:company_packages,id',
                __('companies.invoices.form_input.package.input') . '.*.' . __('companies.invoices.form_input.package.price') => 'required|numeric|min:0',
                __('companies.invoices.form_input.package.input') . '.*.' . __('companies.invoices.form_input.package.qty') => 'required|numeric|min:0',
                __('companies.invoices.form_input.package.input_delete') => 'nullable',
                __('companies.invoices.form_input.package.input_delete') . '.*' => 'required|exists:company_invoice_packages,id',
                /*=== FORM TAXES ===*/
                __('companies.invoices.form_input.taxes.input') => 'nullable',
                __('companies.invoices.form_input.taxes.input') . '.*.' . __('companies.invoices.form_input.taxes.id') => 'nullable|exists:company_invoice_taxes,id',
                __('companies.invoices.form_input.taxes.input') . '.*.' . __('companies.invoices.form_input.taxes.name') => 'required|exists:taxes,id',
                __('companies.invoices.form_input.taxes.delete') => 'nullable',
                __('companies.invoices.form_input.taxes.delete') . '.*' => 'required|exists:company_invoice_taxes,id',
                /*=== FORM DISCOUNTS ===*/
                __('companies.invoices.form_input.discounts.input') => 'nullable',
                __('companies.invoices.form_input.discounts.input') . '.*.' . __('companies.invoices.form_input.discounts.id') => 'nullable|exists:company_invoice_discounts,id',
                __('companies.invoices.form_input.discounts.input') . '.*.' . __('companies.invoices.form_input.discounts.name') => 'required|exists:discounts,id',
                __('companies.invoices.form_input.discounts.delete') => 'nullable',
                __('companies.invoices.form_input.discounts.delete') . '.*' => 'required|exists:company_invoice_discounts,id',

                __('companies.invoices.form_input.grand_total') => 'required|numeric|min:0',
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
            $valid = Validator::make($request->all(),[
                __('companies.form_input.name') => 'required|exists:client_companies,id',
                __('companies.invoices.form_input.periode') => 'required|dateFormat:Y-m-d',
                __('companies.invoices.form_input.package.input') => 'required|array|min:1',
                __('companies.invoices.form_input.package.input') . '.*.'. __('companies.invoices.form_input.package.name') => 'required|exists:company_packages,id',
                __('companies.invoices.form_input.package.input') . '.*.' . __('companies.invoices.form_input.package.price') => 'required|numeric|min:0',
                __('companies.invoices.form_input.package.input') . '.*.' . __('companies.invoices.form_input.package.qty') => 'required|numeric|min:0',
                /*=== FORM TAXES ===*/
                __('companies.invoices.form_input.taxes.input') => 'nullable',
                __('companies.invoices.form_input.taxes.input') . '.*.' . __('companies.invoices.form_input.taxes.name') => 'required|exists:taxes,id',
                /*=== FORM DISCOUNTS ===*/
                __('companies.invoices.form_input.discounts.input') => 'nullable',
                __('companies.invoices.form_input.discounts.input') . '.*.' . __('companies.invoices.form_input.discounts.name') => 'required|exists:discounts,id',

                __('companies.invoices.form_input.grand_total') => 'required|numeric|min:0',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
