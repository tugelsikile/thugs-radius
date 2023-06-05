<?php

namespace App\Validations\Client;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PackageValidation
{
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function create(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                __('companies.packages.form_input.name') => 'required|string|min:3|max:199',
                __('companies.packages.form_input.description') => 'nullable',
                __('companies.packages.form_input.price') => 'required|numeric|min:0',
                __('companies.packages.form_input.duration_type') => 'required|in:minutes,hours,days,weeks,months,years',
                __('companies.packages.form_input.duration_amount') => 'required|numeric|min:0',
                __('companies.packages.form_input.max_customer') => 'required|numeric|min:0',
                __('companies.packages.form_input.max_user') => 'required|numeric|min:0',
                __('companies.packages.form_input.max_voucher') => 'required|numeric|min:0',
                __('companies.packages.form_input.max_router') => 'required|numeric|min:0',
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
                'id' => 'required|exists:company_packages,id',
                __('companies.packages.form_input.name') => 'required|string|min:3|max:199',
                __('companies.packages.form_input.description') => 'nullable',
                __('companies.packages.form_input.price') => 'required|numeric|min:0',
                __('companies.packages.form_input.duration_type') => 'required|in:minutes,hours,days,weeks,months,years',
                __('companies.packages.form_input.duration_amount') => 'required|numeric|min:0',
                __('companies.packages.form_input.max_customer') => 'required|numeric|min:0',
                __('companies.packages.form_input.max_user') => 'required|numeric|min:0',
                __('companies.packages.form_input.max_voucher') => 'required|numeric|min:0',
                __('companies.packages.form_input.max_router') => 'required|numeric|min:0',
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
                'id.*' => 'required|exists:company_packages,id',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
