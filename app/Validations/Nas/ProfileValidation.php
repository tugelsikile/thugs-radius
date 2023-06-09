<?php

namespace App\Validations\Nas;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProfileValidation
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
                __('profiles.form_input.is_additional') => 'required|boolean',
                __('companies.form_input.name') => 'required|exists:client_companies,id',
                __('profiles.form_input.type') => 'required_if:' . __('profiles.form_input.is_additional') . ',0|in:pppoe,hotspot',
                __('nas.form_input.name') => 'required_if:' . __('profiles.form_input.is_additional') . ',0|exists:nas,id',
                __('nas.pools.form_input.name') => 'required_if:' . __('profiles.form_input.is_additional') . ',0|exists:nas_profile_pools,id',
                __('bandwidths.form_input.name') => 'required_if:' . __('profiles.form_input.is_additional') . ',0|exists:nas_profile_bandwidths,id',
                __('profiles.form_input.queue.name') => 'nullable',
                __('profiles.form_input.queue.id') => 'nullable',
                __('profiles.form_input.queue.target') => 'nullable',
                __('profiles.form_input.name') => 'required|string|min:2|max:50|unique:nas_profiles,name,null,null,nas,' . $request[__('nas.form_input.name')],
                __('profiles.form_input.description') => 'nullable',
                __('profiles.form_input.price') => 'required|numeric|min:0',
                __('profiles.form_input.limitation.type') => 'nullable',
                __('profiles.form_input.limitation.rate') => 'required_with:' . $request[__('profiles.form_input.limitation.type')] . '|numeric|min:0',
                __('profiles.form_input.limitation.unit') => 'required_with:' . $request[__('profiles.form_input.limitation.type')],
                __('profiles.form_input.address.dns') => 'nullable',
                __('profiles.form_input.address.dns') . '.*' => 'required|ip',
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
                'id.*' => 'required|exists:nas_profiles,id'
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
                __('profiles.form_input.id') => 'required|exists:nas_profiles,id',
                __('profiles.form_input.is_additional') => 'required|boolean',
                __('companies.form_input.name') => 'required|exists:client_companies,id',
                __('profiles.form_input.type') => 'required_if:' . __('profiles.form_input.is_additional') . ',0|in:pppoe,hotspot',
                __('nas.form_input.name') => 'required_if:' . __('profiles.form_input.is_additional') . ',0|exists:nas,id',
                __('nas.pools.form_input.name') => 'required_if:' . __('profiles.form_input.is_additional') . ',0|exists:nas_profile_pools,id',
                __('bandwidths.form_input.name') => 'required_if:' . __('profiles.form_input.is_additional') . ',0|exists:nas_profile_bandwidths,id',
                __('profiles.form_input.queue.name') => 'nullable',
                __('profiles.form_input.queue.id') => 'nullable',
                __('profiles.form_input.queue.target') => 'nullable',
                __('profiles.form_input.name') => 'required|string|min:2|max:50|unique:nas_profiles,name,'.$request[__('profiles.form_input.id')].',id,nas,' . $request[__('nas.form_input.name')],
                __('profiles.form_input.description') => 'nullable',
                __('profiles.form_input.price') => 'required|numeric|min:0',
                __('profiles.form_input.limitation.type') => 'nullable',
                __('profiles.form_input.limitation.rate') => 'required_with:' . $request[__('profiles.form_input.limitation.type')] . '|numeric|min:0',
                __('profiles.form_input.limitation.unit') => 'required_with:' . $request[__('profiles.form_input.limitation.type')],
                __('profiles.form_input.address.dns') => 'nullable',
                __('profiles.form_input.address.dns') . '.*' => 'required|ip',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
