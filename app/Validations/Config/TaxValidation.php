<?php

namespace App\Validations\Config;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaxValidation
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
                __('companies.form_input.name') => 'nullable|exists:client_companies,id',
                __('taxes.form_input.code') => 'required|string|min:1|max:60|unique:taxes,code,null,null,company,' . $request[__('companies.form_input.name')],
                __('taxes.form_input.name') => 'required|string|min:1|max:199',
                __('taxes.form_input.description') => 'nullable',
                __('taxes.form_input.percent') => 'required|numeric|min:0|max:100',
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
                __('taxes.form_input.id') => 'required|exists:taxes,id',
                __('companies.form_input.name') => 'nullable|exists:client_companies,id',
                __('taxes.form_input.code') => 'required|string|min:1|max:60|unique:taxes,code,' . $request[__('taxes.form_input.id')] . ',id,company,'  . $request[__('companies.form_input.name')],
                __('taxes.form_input.name') => 'required|string|min:1|max:199',
                __('taxes.form_input.description') => 'nullable',
                __('taxes.form_input.percent') => 'required|numeric|min:0|max:100',
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
                'id.*' => 'required|exists:taxes,id',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
