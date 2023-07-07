<?php /** @noinspection DuplicatedCode */

namespace App\Validations\Customer;

use App\Helpers\SwitchDB;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CustomerValidation
{
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function kickOnlineUser(Request $request): Request
    {
        try {
            new SwitchDB();
            $valid = Validator::make($request->all(),[
                'username' => 'required|exists:customers,nas_username'
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
    public function testConnectionWizard(Request $request): Request
    {
        try {
            new SwitchDB();
            $valid = Validator::make($request->all(),[
                __('customers.form_input.id') => 'required|exists:customers,id'
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
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
            new SwitchDB();
            $valid = Validator::make($request->all(),[
                __('nas.form_input.name') => 'required|exists:nas,id',
                __('profiles.form_input.name') => 'required|exists:nas_profiles,id',
                __('customers.hotspot.form_input.username') => 'required|min:1|max:70unique:customers,nas_username',
                __('customers.hotspot.form_input.password') => 'required|min:1|max:70',
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
                'id' => 'required|array|min:1',
                'id.*' => 'required|exists:customers,id'
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
    public function statusActive(Request $request): Request
    {
        try {
            new SwitchDB();
            $valid = Validator::make($request->all(),[
                'id' => 'required|exists:customers,id'
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
            new SwitchDB();
            $valid = Validator::make($request->all(),[
                __('customers.form_input.id') => 'required|exists:customers,id',
                __('nas.form_input.name') => 'required|exists:nas,id',
                __('profiles.form_input.name') => 'required|exists:nas_profiles,id',
                __('customers.form_input.type') => 'required|in:hotspot,pppoe',
                __('customers.form_input.name') => 'required|string|min:1|max:199',
                __('customers.form_input.address.street') => 'nullable',
                __('customers.form_input.address.phone') => 'nullable'
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            if ($request->has(__('customers.form_input.email'))) {
                $valid = Validator::make($request->all(),[
                    __('customers.form_input.email') => 'email'
                ]);
                if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            }
            new SwitchDB("mysql");
            $valid = Validator::make($request->all(),[
                __('customers.form_input.email') => 'nullable|unique:users,email,' . $request[__('customers.form_input.id')] . ',id',
                __('customers.form_input.address.village') => 'nullable|exists:' . config('laravolt.indonesia.table_prefix') . 'villages,code',
                __('customers.form_input.address.district') => 'nullable|exists:' . config('laravolt.indonesia.table_prefix') . 'districts,code',
                __('customers.form_input.address.city') => 'nullable|exists:' . config('laravolt.indonesia.table_prefix') . 'cities,code',
                __('customers.form_input.address.province') => 'nullable|exists:' . config('laravolt.indonesia.table_prefix') . 'provinces,code',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            new SwitchDB();
            $valid = Validator::make($request->all(),[
                __('customers.form_input.address.postal') => 'nullable',
                __('customers.form_input.username') => 'required|string|min:3|max:50|unique:customers,nas_username,' . $request[__('customers.form_input.id')] . ',id',
                __('customers.form_input.password') => 'required|string|min:3|max:50',
                __('customers.form_input.service.input') => 'nullable',
                __('customers.form_input.service.input') . '.*.' . __('customers.form_input.service.id') => 'nullable|exists:customer_additional_services,id',
                __('customers.form_input.service.input') . '.*.' . __('customers.form_input.service.name') => 'required|exists:nas_profiles,id',
                __('customers.form_input.service.delete') => 'nullable',
                __('customers.form_input.service.delete') . '.*' => 'required|exists:customer_additional_services,id',

                __('customers.form_input.taxes.input') => 'nullable',
                __('customers.form_input.taxes.input') . '.*.' . __('customers.form_input.taxes.id') => 'nullable|exists:customer_taxes,id',
                __('customers.form_input.taxes.delete') => 'nullable',
                __('customers.form_input.taxes.delete') . '.*' => 'required|exists:customer_taxes,id',
                __('customers.form_input.discounts.input') => 'nullable',
                __('customers.form_input.discounts.input') . '.*.' . __('customers.form_input.discounts.id') => 'nullable|exists:customer_discounts,id',
                __('customers.form_input.discounts.delete') => 'nullable',
                __('customers.form_input.discounts.delete') . '.*' => 'required|exists:customer_discounts,id'
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            new SwitchDB("mysql");
            $valid = Validator::make($request->all(),[
                __('customers.form_input.taxes.input') . '.*.' . __('customers.form_input.taxes.name') => 'required|exists:taxes,id',
                __('customers.form_input.discounts.input') . '.*.' . __('customers.form_input.discounts.name') => 'required|exists:discounts,id',
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
            $valid = Validator::make($request->all(),[
                __('nas.form_input.name') => 'required|exists:nas,id',
                __('profiles.form_input.name') => 'required|exists:nas_profiles,id',
                __('customers.form_input.type') => 'required|in:hotspot,pppoe',
                __('customers.form_input.name') => 'required|string|min:1|max:199',
                __('customers.form_input.address.street') => 'nullable',
                __('customers.form_input.address.phone') => 'nullable'
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            if ($request->has(__('customers.form_input.email'))) {
                $valid = Validator::make($request->all(),[
                    __('customers.form_input.email') => 'email'
                ]);
                if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            }
            new SwitchDB("mysql");
            $valid = Validator::make($request->all(),[
                __('customers.form_input.email') => 'nullable|unique:users,email',
                __('customers.form_input.address.village') => 'nullable|exists:' . config('laravolt.indonesia.table_prefix') . 'villages,code',
                __('customers.form_input.address.district') => 'nullable|exists:' . config('laravolt.indonesia.table_prefix') . 'districts,code',
                __('customers.form_input.address.city') => 'nullable|exists:' . config('laravolt.indonesia.table_prefix') . 'cities,code',
                __('customers.form_input.address.province') => 'nullable|exists:' . config('laravolt.indonesia.table_prefix') . 'provinces,code',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            new SwitchDB();
            $valid = Validator::make($request->all(),[
                __('customers.form_input.address.postal') => 'nullable',
                __('customers.form_input.username') => 'required|string|min:3|max:50|unique:customers,nas_username',
                __('customers.form_input.password') => 'required|string|min:3|max:50',
                __('customers.form_input.service.input') => 'nullable',
                __('customers.form_input.service.input') . '.*.' . __('customers.form_input.service.id') => 'nullable|exists:customer_additional_services,id',
                __('customers.form_input.service.input') . '.*.' . __('customers.form_input.service.name') => 'required|exists:nas_profiles,id',
                __('customers.form_input.service.delete') => 'nullable',
                __('customers.form_input.service.delete') . '.*' => 'required|exists:customer_additional_services,id',

                __('customers.form_input.taxes.input') => 'nullable',
                __('customers.form_input.taxes.input') . '.*.' . __('customers.form_input.taxes.id') => 'nullable|exists:customer_taxes,id',
                __('customers.form_input.taxes.delete') => 'nullable',
                __('customers.form_input.taxes.delete') . '.*' => 'required|exists:customer_taxes,id',
                __('customers.form_input.discounts.input') => 'nullable',
                __('customers.form_input.discounts.input') . '.*.' . __('customers.form_input.discounts.id') => 'nullable|exists:customer_discounts,id',
                __('customers.form_input.discounts.delete') => 'nullable',
                __('customers.form_input.discounts.delete') . '.*' => 'required|exists:customer_discounts,id'
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            new SwitchDB("mysql");
            $valid = Validator::make($request->all(),[
                __('customers.form_input.taxes.input') . '.*.' . __('customers.form_input.taxes.name') => 'required|exists:taxes,id',
                __('customers.form_input.discounts.input') . '.*.' . __('customers.form_input.discounts.name') => 'required|exists:discounts,id',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
