<?php /** @noinspection DuplicatedCode */

namespace App\Validations;

use DateTimeZone;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ConfigValidation
{
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function deleteDiscount(Request $request): Request
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
    public function updateDiscount(Request $request): Request
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
    public function createDiscount(Request $request): Request
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
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function createTax(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                __('companies.form_input.name') => 'nullable|exists:client_companies,id',
                __('taxes.form_input.code') => 'required|string|min:1|max:60|unique:taxes,code',
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
    public function updateTax(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                __('taxes.form_input.id') => 'required|exists:taxes,id',
                __('companies.form_input.name') => 'nullable|exists:client_companies,id',
                __('taxes.form_input.code') => 'required|string|min:1|max:60|unique:taxes,code,' . $request[__('taxes.form_input.id')] . ',id',
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
    public function deleteTax(Request $request): Request
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
    private function tzLists() {
        return $timezone_identifiers = DateTimeZone::listIdentifiers();
    }

    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function updateTimezone(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                __('timezones.form_input.name') => 'required|in:' . collect($this->tzLists())->join(','),
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
