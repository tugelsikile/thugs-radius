<?php

namespace App\Validations\Client;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CompanyConfigValidation
{
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function updateAddress(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                __('configs.address.form_input.id') => 'required|exists:client_companies,id',
                __('configs.address.form_input.logo') => 'nullable|image',
                __('configs.address.form_input.delete_logo') => 'nullable',
                __('configs.address.form_input.name') => 'required|string|min:3|max:199',
                __('configs.address.form_input.phone') => 'nullable',
                __('configs.address.form_input.email') => 'required|email|unique:client_companies,email,' . $request[__('configs.address.form_input.id')] . ',id',
                __('configs.address.form_input.street') => 'nullable',
                __('configs.address.form_input.village') => 'nullable|exists:' . config('laravolt.indonesia.table_prefix') . 'villages,code',
                __('configs.address.form_input.district') => 'nullable|exists:' . config('laravolt.indonesia.table_prefix') . 'districts,code',
                __('configs.address.form_input.city') => 'nullable|exists:' . config('laravolt.indonesia.table_prefix') . 'cities,code',
                __('configs.address.form_input.province') => 'nullable|exists:' . config('laravolt.indonesia.table_prefix') . 'provinces,code',
                __('configs.address.form_input.postal') => 'nullable',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
