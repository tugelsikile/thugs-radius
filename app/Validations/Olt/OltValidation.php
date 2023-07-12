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
}
