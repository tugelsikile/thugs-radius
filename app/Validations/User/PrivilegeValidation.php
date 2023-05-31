<?php

namespace App\Validations\User;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PrivilegeValidation
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
                'id' => 'required|array|min:1',
                'id.*' => 'required|exists:user_levels,id'
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
                'id' => 'required|exists:user_levels,id',
                __('messages.privileges.form_input.client') => 'required|in:ya,tidak',
                __('messages.privileges.form_input.company') => 'required_if:'.__('messages.privileges.form_input.client').',ya|exists:client_companies,id',
                __('messages.privileges.form_input.name') => 'required|string|min:3|max:199',
                __('messages.privileges.form_input.description') => 'nullable',
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
                __('messages.privileges.form_input.client') => 'required|in:ya,tidak',
                __('messages.privileges.form_input.company') => 'required_if:'.__('messages.privileges.form_input.client').',ya|exists:client_companies,id',
                __('messages.privileges.form_input.name') => 'required|string|min:3|max:199',
                __('messages.privileges.form_input.description') => 'nullable',
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
    public function setPrivilege(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                'id' => 'required|exists:user_privileges,id',
                'type' => 'required|in:read,create,update,delete'
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
