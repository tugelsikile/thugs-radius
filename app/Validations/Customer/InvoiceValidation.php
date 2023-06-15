<?php

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
