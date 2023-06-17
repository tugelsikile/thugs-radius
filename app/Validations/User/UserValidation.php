<?php

namespace App\Validations\User;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserValidation
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
                __('users.form_input.id') => 'required|array|min:1',
                __('users.form_input.id') . '.*' => 'required|exists:users,id'
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
                __('users.privileges.form_input.name') => 'required|exists:user_levels,id',
                __('companies.form_input.name') => 'nullable|exists:client_companies,id',
                __('users.form_input.name') => 'required|string|min:2|max:199',
                __('users.form_input.email') => 'required|email|unique:users,email',
                __('users.form_input.password.current') => 'required|string|min:6|confirmed',
                __('users.form_input.lang') => 'required|in:id,en',
                __('users.form_input.date_format') => 'required|in:' . json_encode(allowedDateFormat()),
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
    public function update(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                __('users.form_input.id') => 'required|exists:users,id',
                __('users.privileges.form_input.name') => 'required|exists:user_levels,id',
                __('companies.form_input.name') => 'nullable|exists:client_companies,id',
                __('users.form_input.name') => 'required|string|min:2|max:199',
                __('users.form_input.email') => 'required|email|unique:users,email,' . $request[__('users.form_input.id')] . ',id',
                __('users.form_input.lang') => 'required|in:id,en',
                __('users.form_input.date_format') => 'required|in:' . json_encode(allowedDateFormat()),
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
