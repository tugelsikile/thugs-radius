<?php

namespace App\Validations\Config;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DiscountValidation
{
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
                'id.*' => 'required|exists:discounts,id'
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
                __('discounts.form_input.id') => 'required|exists:discounts,id',
                __('companies.form_input.name') => 'nullable|exists:client_companies,id',
                __('discounts.form_input.code') => 'required|string|min:1|max:50|unique:discounts,code,' . $request[__('discounts.form_input.id')] . ',id',
                __('discounts.form_input.name') => 'required|string|min:1|max:199',
                __('discounts.form_input.amount') => 'required|numeric|min:0',
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
                __('companies.form_input.name') => 'nullable|exists:client_companies,id',
                __('discounts.form_input.code') => 'required|string|min:1|max:50|unique:discounts,code',
                __('discounts.form_input.name') => 'required|string|min:1|max:199',
                __('discounts.form_input.amount') => 'required|numeric|min:0',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
