<?php

namespace App\Validations\Olt;

use App\Helpers\SwitchDB;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OltValidation
{
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function unConfigure(Request $request): Request
    {
        try {
            new SwitchDB();
            $valid = Validator::make($request->all(),[
                __('olt.form_input.id') => 'required|exists:olts,id',
                __('olt.form_input.onu') => 'required'
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
    public function unlinkCustomer(Request $request): Request
    {
        try {
            new SwitchDB();
            $valid = Validator::make($request->all(),[
                __('olt.form_input.onu') => 'required|exists:customers,onu_index',
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
    public function createCustomer(Request $request): Request
    {
        try {
            new SwitchDB();
            $valid = Validator::make($request->all(),[
                __('olt.form_input.onu') => 'required|unique:customers,onu_index',
                __('olt.form_input.id') => 'required|exists:olts,id',
                __('customers.form_input.id') => 'required|exists:customers,id',
                __('olt.form_input.customer') => 'nullable',
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
    public function gponCustomer(Request $request): Request
    {
        try {
            new SwitchDB();
            $valid = Validator::make($request->all(),[
                __('olt.form_input.id') => 'required|exists:olts,id',
                __('olt.form_input.onu') => 'required|string|min:3',
                __('olt.form_input.phase_state') => 'nullable',
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
                __('olt.form_input.name') => 'required|string|min:2|max:64',
                __('olt.form_input.port') => 'required|numeric|min:0',
                __('olt.form_input.host') => 'required|ip|unique:olts,hostname',
                __('olt.form_input.user') => 'required|string|min:2|max:64',
                __('olt.form_input.pass') => 'required|string|min:2|max:64',
                __('olt.form_input.prompts.user') => 'required|string|min:1|max:199',
                __('olt.form_input.prompts.pass') => 'required|string|min:1|max:199',
                __('olt.form_input.brand') => 'required|in:zte',
                __('olt.form_input.model') => 'required|in:zte_320',
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
                __('olt.form_input.id') => 'required|exists:olts,id',
                __('olt.form_input.name') => 'required|string|min:2|max:64',
                __('olt.form_input.port') => 'required|numeric|min:0',
                __('olt.form_input.host') => 'required|ip|unique:olts,hostname,' . $request[__('olt.form_input.id')] . ',id',
                __('olt.form_input.user') => 'required|string|min:2|max:64',
                __('olt.form_input.pass') => 'required|string|min:2|max:64',
                __('olt.form_input.prompts.user') => 'required|string|min:1|max:199',
                __('olt.form_input.prompts.pass') => 'required|string|min:1|max:199',
                __('olt.form_input.brand') => 'required|in:zte',
                __('olt.form_input.model') => 'required|in:zte_320',
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
    public function gponStates(Request $request): Request
    {
        try {
            new SwitchDB();
            $valid = Validator::make($request->all(),[
                __('olt.form_input.id') => 'required|exists:olts,id',
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
    public function testConnection(Request $request): Request
    {
        try {
            new SwitchDB();
            $valid = Validator::make($request->all(),[
                __('olt.form_input.port') => 'required|numeric|min:0',
                __('olt.form_input.host') => 'required|ip',
                __('olt.form_input.user') => 'required|string|min:2|max:64',
                __('olt.form_input.pass') => 'required|string|min:2|max:64',
                __('olt.form_input.prompts.user') => 'required|string|min:1|max:199',
                __('olt.form_input.prompts.pass') => 'required|string|min:1|max:199',
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
                __('olt.form_input.id') => 'required|array|min:1',
                __('olt.form_input.id') . '.*' => 'required|exists:olts,id',
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
    public function registerCustomer(Request $request): Request
    {
        try {
            new SwitchDB();
            $availableTconts = collect();
            $availableGemports = collect();
            $availableVlans = collect();
            if ($request->has(__('olt.form_input.onus.tcont.input'))) {
                foreach ($request[__('olt.form_input.onus.tcont.input')] as $item) {
                    if (array_key_exists(__('olt.form_input.onus.tcont.id'), $item)) {
                        $availableTconts->push($item[__('olt.form_input.onus.tcont.id')]);
                    }
                }
            }
            if ($request->has(__('olt.form_input.onus.vlan.input'))) {
                foreach ($request[__('olt.form_input.onus.vlan.input')] as $item) {
                    if (array_key_exists(__('olt.form_input.onus.vlan.user'),$item)) {
                        $availableVlans->push($item[__('olt.form_input.onus.vlan.user')]);
                    }
                }
            }
            if ($request->has(__('olt.form_input.onus.gemport.input'))) {
                foreach ($request[__('olt.form_input.onus.gemport.input')] as $item) {
                    if (array_key_exists(__('olt.form_input.onus.gemport.id'),$item)) {
                        $availableGemports->push($item[__('olt.form_input.onus.gemport.id')]);
                    }
                }
            }
            $valid = Validator::make($request->all(),[
                __('olt.form_input.id') => 'required|exists:olts,id',
                __('olt.form_input.onus.current') => 'required',
                __('olt.form_input.onus.olt') => 'required',
                __('olt.form_input.onus.index') => 'required|numeric|min:1|max:128',
                __('olt.form_input.onus.name') => 'required|string|min:1|max:255',
                __('olt.form_input.onus.description') => 'required|string|min:max:255',
                __('olt.form_input.onus.sn') => 'required|string|min:10',
                __('customers.form_input.id') => 'required|exists:customers,id',
                __('olt.form_input.onus.type') => 'required',
                __('olt.form_input.onus.pon_mng.vlan') => 'required',
                __('olt.form_input.brand') => 'required|string|in:huawei,zte,fiberhome,other',
                __('olt.form_input.onus.tcont.input') => 'required|array|min:1',
                __('olt.form_input.onus.tcont.input') . '.*.' . __('olt.form_input.onus.tcont.id') => 'required|numeric|min:1|max:128',
                __('olt.form_input.onus.tcont.input') . '.*.' . __('olt.form_input.onus.tcont.profile') => 'required|string',
                __('olt.form_input.onus.gemport.input') => 'required|array|min:1',
                __('olt.form_input.onus.gemport.input') . '.*.' . __('olt.form_input.onus.gemport.id') => 'required|numeric|min:1|max:128',
                __('olt.form_input.onus.gemport.input') . '.*.' . __('olt.form_input.onus.gemport.upstream') => 'required|string',
                __('olt.form_input.onus.gemport.input') . '.*.' . __('olt.form_input.onus.gemport.downstream') => 'required|string',
                __('olt.form_input.onus.gemport.input') . '.*.' . __('olt.form_input.onus.tcont.input') => 'required|numeric|min:1|max:128|in:' . $availableTconts->join(','),
                __('olt.form_input.onus.vlan.input') => 'required|array|min:1',
                __('olt.form_input.onus.vlan.input') . '.*.' . __('olt.form_input.onus.vlan.port') => 'required|numeric|min:1|max:128',
                __('olt.form_input.onus.vlan.input') . '.*.' . __('olt.form_input.onus.vlan.vport') => 'required|numeric|min:1|max:128',
                __('olt.form_input.onus.vlan.input') . '.*.' . __('olt.form_input.onus.vlan.user') => 'required|string',
                __('olt.form_input.onus.vlan.input') . '.*.' . __('olt.form_input.onus.vlan.service') => 'required|string',
                __('olt.form_input.onus.pon_mng.input') => 'required|array|min:1',
                __('olt.form_input.onus.pon_mng.input') . '.*.' . __('olt.form_input.onus.pon_mng.name') => 'required|string|min:1|max:255',
                __('olt.form_input.onus.pon_mng.input') . '.*.' . __('olt.form_input.onus.gemport.input') => 'required|in:' . $availableGemports->join(','),
                __('olt.form_input.onus.pon_mng.input') . '.*.' . __('olt.form_input.onus.vlan.input') => 'required|in:' . $availableVlans->join(','),
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
