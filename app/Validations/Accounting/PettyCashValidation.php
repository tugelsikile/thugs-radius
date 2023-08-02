<?php

namespace App\Validations\Accounting;

use App\Helpers\SwitchDB;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PettyCashValidation
{
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function approve(Request $request): Request
    {
        try {
            new SwitchDB();
            $valid = Validator::make($request->all(),[
                __('petty_cash.form_input.id') => 'required|exists:petty_cashes,id',
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
                __('petty_cash.form_input.id') => 'required|array|min:1',
                __('petty_cash.form_input.id') . '.*' => 'required|exists:petty_cashes,id',
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
                __('petty_cash.form_input.period') => 'required|dateFormat:Y-m-d',
                __('petty_cash.form_input.type') => 'required|string|in:input,output',
                __('petty_cash.form_input.name') => 'required|string|min:1|max:199',
                __('petty_cash.form_input.description') => 'nullable',
                __('petty_cash.form_input.amount') => 'required|numeric|min:0',
                __('petty_cash.form_input.approve') => 'required|boolean',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
    public function update(Request $request): Request
    {
        try {
            new SwitchDB();
            $valid = Validator::make($request->all(),[
                __('petty_cash.form_input.id') => 'required|exists:petty_cashes,id',
                __('petty_cash.form_input.period') => 'required|dateFormat:Y-m-d',
                __('petty_cash.form_input.type') => 'required|string|in:input,output',
                __('petty_cash.form_input.name') => 'required|string|min:1|max:199',
                __('petty_cash.form_input.description') => 'nullable',
                __('petty_cash.form_input.amount') => 'required|numeric|min:0',
                __('petty_cash.form_input.approve') => 'required|boolean',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
