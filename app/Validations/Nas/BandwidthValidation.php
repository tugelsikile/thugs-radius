<?php

namespace App\Validations\Nas;

use App\Helpers\SwitchDB;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BandwidthValidation
{
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
                'id.*' => 'required|exists:nas_profile_bandwidths,id'
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
                __('bandwidths.form_input.name') => 'required|string:min:2|max:50',
                __('bandwidths.form_input.description') => 'nullable',
                __('bandwidths.form_input.max_limit.up') => 'required|numeric|min:0',
                __('bandwidths.form_input.max_limit.down') => 'required|numeric|min:0',
                __('bandwidths.form_input.burst.up') => 'required|numeric|min:0',
                __('bandwidths.form_input.burst.down') => 'required|numeric|min:0',
                __('bandwidths.form_input.threshold.up') => 'required|numeric|min:0',
                __('bandwidths.form_input.threshold.down') => 'required|numeric|min:0',
                __('bandwidths.form_input.time.up') => 'required|numeric|min:0',
                __('bandwidths.form_input.time.down') => 'required|numeric|min:0',
                __('bandwidths.form_input.limit_at.up') => 'required|numeric|min:0',
                __('bandwidths.form_input.limit_at.down') => 'required|numeric|min:0',
                __('bandwidths.form_input.priority') => 'required|numeric|min:1|max:8',
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
                __('bandwidths.form_input.id') => 'required|exists:nas_profile_bandwidths,id',
                __('bandwidths.form_input.name') => 'required|string:min:2|max:50',
                __('bandwidths.form_input.description') => 'nullable',
                __('bandwidths.form_input.max_limit.up') => 'required|numeric|min:0',
                __('bandwidths.form_input.max_limit.down') => 'required|numeric|min:0',
                __('bandwidths.form_input.burst.up') => 'required|numeric|min:0',
                __('bandwidths.form_input.burst.down') => 'required|numeric|min:0',
                __('bandwidths.form_input.threshold.up') => 'required|numeric|min:0',
                __('bandwidths.form_input.threshold.down') => 'required|numeric|min:0',
                __('bandwidths.form_input.time.up') => 'required|numeric|min:0',
                __('bandwidths.form_input.time.down') => 'required|numeric|min:0',
                __('bandwidths.form_input.limit_at.up') => 'required|numeric|min:0',
                __('bandwidths.form_input.limit_at.down') => 'required|numeric|min:0',
                __('bandwidths.form_input.priority') => 'required|numeric|min:1|max:8',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
