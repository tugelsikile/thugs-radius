<?php

namespace App\Validations\Config;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentGatewayValidation
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
                __('gateways.form_input.id') => 'required|array|min:1',
                __('gateways.form_input.id') . '.*' => 'required|exists:payment_gateways,id'
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
    public function activate(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                __('gateways.form_input.id') => 'required|exists:payment_gateways,id'
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
                __('gateways.form_input.id') => 'required|exists:payment_gateways,id',
                __('companies.form_input.name') => 'required|exists:client_companies,id',
                __('gateways.form_input.name') => 'required|string|min:2|max:199',
                __('gateways.form_input.description') => 'nullable',
                __('gateways.form_input.production_mode') => 'required|boolean',
                __('gateways.form_input.module') => 'required|in:duitku,briapi',
                __('gateways.form_input.url') => 'required_with:' . $request[__('gateways.form_input.module')] . '|url',
                __('gateways.form_input.website') => 'required_with:' . $request[__('gateways.form_input.module')] . '|url',

                /***** DUITKU VALIDATION *****/
                __('gateways.form_input.duitku.merchant_code') => 'required_if:' . __('gateways.form_input.module') . ',duitku',
                __('gateways.form_input.duitku.api_key') => 'required_if:' . __('gateways.form_input.module') . ',duitku',

                /***** BRIAPI VALIDATION *****/
                __('gateways.form_input.briapi.consumer_key') => 'required_if:' . __('gateways.form_input.module') . ',briapi',
                __('gateways.form_input.briapi.consumer_secret') => 'required_if:' . __('gateways.form_input.module') . ',briapi',
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
                __('gateways.form_input.name') => 'required|string|min:2|max:199',
                __('gateways.form_input.description') => 'nullable',
                __('gateways.form_input.production_mode') => 'required|boolean',
                __('gateways.form_input.module') => 'required|in:duitku,briapi',
                __('gateways.form_input.url') => 'required_with:' . $request[__('gateways.form_input.module')] . '|url',
                __('gateways.form_input.website') => 'required_with:' . $request[__('gateways.form_input.module')] . '|url',

                /***** DUITKU VALIDATION *****/
                __('gateways.form_input.duitku.merchant_code') => 'required_if:' . __('gateways.form_input.module') . ',duitku',
                __('gateways.form_input.duitku.api_key') => 'required_if:' . __('gateways.form_input.module') . ',duitku',

                /***** BRIAPI VALIDATION *****/
                __('gateways.form_input.briapi.consumer_key') => 'required_if:' . __('gateways.form_input.module') . ',briapi',
                __('gateways.form_input.briapi.consumer_secret') => 'required_if:' . __('gateways.form_input.module') . ',briapi',
            ]);

            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
