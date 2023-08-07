<?php

namespace App\Validations\Accounting;

use App\Helpers\SwitchDB;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CashFlowValidation
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
    public function createCategory(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(), [
                __('cash_flow.form_input.category.id') => 'nullable',
                __('cash_flow.form_input.category.name') => 'required|string|min:1|max:199',
                __('cash_flow.form_input.category.description') => 'nullable',
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
    public function updateCategory(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(), [
                __('cash_flow.form_input.category.id') => 'required|exists:categories,id',
                __('cash_flow.form_input.category.name') => 'required|string|min:1|max:199',
                __('cash_flow.form_input.category.description') => 'nullable',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
    public function createAccount(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(), [
                __('cash_flow.form_input.account.id') => 'nullable',
                __('cash_flow.form_input.account.name') => 'required|string|min:1|max:199',
                __('cash_flow.form_input.account.description') => 'nullable',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
    public function updateAccount(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(), [
                __('cash_flow.form_input.account.id') => 'required|exists:accounts,id',
                __('cash_flow.form_input.account.name') => 'required|string|min:1|max:199',
                __('cash_flow.form_input.account.description') => 'nullable',
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
            $valid = Validator::make($request->all(), [
                __('cash_flow.form_input.id') => 'nullable',
                __('cash_flow.form_input.code') => 'nullable',
                __('cash_flow.form_input.type') => 'required|string',
                __('cash_flow.form_input.account.label') => 'required|exists:accounts,id',
                __('cash_flow.form_input.category.label') => 'required|exists:categories,id',
                __('cash_flow.form_input.periods.label') => 'required|dateFormat:Y-m-d',
                __('cash_flow.form_input.description') => 'required|string|min:1',
                __('cash_flow.form_input.amount') => 'required|numeric|min:0',
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
            $valid = Validator::make($request->all(), [
                __('cash_flow.form_input.id') => 'required|array|min:1',
                __('cash_flow.form_input.id') . '.*' => 'required|exists:cash_flows,id',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
