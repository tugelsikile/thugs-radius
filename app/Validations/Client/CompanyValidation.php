<?php /** @noinspection DuplicatedCode */

namespace App\Validations\Client;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CompanyValidation
{
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function activate(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                'id' => 'required|exists:client_companies,id'
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
                'id.*' => 'required|exists:client_companies,id'
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
                __('companies.form_input.name') => 'required|string|min:2|max:199|unique:client_companies,name',
                __('companies.form_input.email') => 'required|email|unique:client_companies,email',
                __('companies.form_input.address') => 'required|string|min:5',
                __('regions.village.form_input') => 'required|exists:' . config('laravolt.indonesia.table_prefix') . 'villages,code',
                __('regions.district.form_input') => 'required|exists:' . config('laravolt.indonesia.table_prefix') . 'districts,code',
                __('regions.city.form_input') => 'required|exists:' . config('laravolt.indonesia.table_prefix') . 'cities,code',
                __('regions.province.form_input') => 'required|exists:' . config('laravolt.indonesia.table_prefix') . 'provinces,code',
                __('companies.form_input.postal') => 'required|numeric|digits:5',
                __('companies.form_input.phone') => 'nullable',
                /*=== FORM ADDITIONAL PACKAGE ===*/
                __('companies.packages.form_input.additional') => 'nullable',
                __('companies.packages.form_input.additional') . '.*.' . __('companies.packages.form_input.id') => 'nullable|exists:additional_packages,id',
                __('companies.packages.form_input.additional') . '.*.' . __('companies.packages.form_input.name') => 'required|exists:company_packages,id',
                __('companies.packages.form_input.additional') . '.*.' . __('companies.packages.form_input.otp') => 'required|in:0,1',
                __('companies.packages.form_input.additional') . '.*.' . __('companies.packages.form_input.qty') => 'required|numeric|min:1',
                /*=== FORM TAXES ===*/
                __('companies.form_input.taxes.array_input') => 'nullable',
                __('companies.form_input.taxes.array_input') . '.*.' . __('companies.form_input.taxes.id') => 'nullable|exists:company_taxes,id',
                __('companies.form_input.taxes.array_input') . '.*.' . __('companies.form_input.taxes.name') => 'required|exists:taxes,id',
                /*=== FORM DISCOUNTS ===*/
                __('companies.form_input.discounts.array_input') => 'nullable',
                __('companies.form_input.discounts.array_input') . '.*.' . __('companies.form_input.discounts.id') => 'nullable|exists:company_discounts,id',
                __('companies.form_input.discounts.array_input') . '.*.' . __('companies.form_input.discounts.name') => 'required|exists:discounts,id',

                __('companies.form_input.grand_total') => 'required|numeric|min:0',
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
                'id' => 'required|exists:client_companies,id',
                __('companies.form_input.name') => 'required|string|min:2|max:199|unique:client_companies,name,' . $request->id . ',id',
                __('companies.form_input.email') => 'required|email|unique:client_companies,email,' . $request->id . ',id',
                __('companies.form_input.address') => 'required|string|min:5',
                __('regions.village.form_input') => 'required|exists:' . config('laravolt.indonesia.table_prefix') . 'villages,code',
                __('regions.district.form_input') => 'required|exists:' . config('laravolt.indonesia.table_prefix') . 'districts,code',
                __('regions.city.form_input') => 'required|exists:' . config('laravolt.indonesia.table_prefix') . 'cities,code',
                __('regions.province.form_input') => 'required|exists:' . config('laravolt.indonesia.table_prefix') . 'provinces,code',
                __('companies.form_input.postal') => 'required|numeric|digits:5',
                __('companies.form_input.phone') => 'nullable',
                /*=== FORM ADDITIONAL PACKAGE ===*/
                __('companies.packages.form_input.additional') => 'nullable',
                __('companies.packages.form_input.additional') . '.*.' . __('companies.packages.form_input.id') => 'nullable|exists:additional_packages,id',
                __('companies.packages.form_input.additional') . '.*.' . __('companies.packages.form_input.name') => 'required|exists:company_packages,id',
                __('companies.packages.form_input.additional') . '.*.' . __('companies.packages.form_input.otp') => 'required|in:0,1',
                __('companies.packages.form_input.additional') . '.*.' . __('companies.packages.form_input.qty') => 'required|numeric|min:1',
                __('companies.packages.form_input.additional_deleted') => 'nullable',
                __('companies.packages.form_input.additional_deleted') . '.*' => 'required|exists:additional_packages,id',
                /*=== FORM TAXES ===*/
                __('companies.form_input.taxes.array_input') => 'nullable',
                __('companies.form_input.taxes.array_input') . '.*.' . __('companies.form_input.taxes.id') => 'nullable|exists:company_taxes,id',
                __('companies.form_input.taxes.array_input') . '.*.' . __('companies.form_input.taxes.name') => 'required|exists:taxes,id',
                __('companies.form_input.taxes.array_delete') => 'nullable',
                __('companies.form_input.taxes.array_delete') . '.*' => 'required|exists:company_taxes,id',
                /*=== FORM DISCOUNTS ===*/
                __('companies.form_input.discounts.array_input') => 'nullable',
                __('companies.form_input.discounts.array_input') . '.*.' . __('companies.form_input.discounts.id') => 'nullable|exists:company_discounts,id',
                __('companies.form_input.discounts.array_input') . '.*.' . __('companies.form_input.discounts.name') => 'required|exists:discounts,id',
                __('companies.form_input.discounts.array_delete') => 'nullable',
                __('companies.form_input.discounts.array_delete') . '.*' => 'required|exists:company_discounts,id',

                __('companies.form_input.grand_total') => 'required|numeric|min:0',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
