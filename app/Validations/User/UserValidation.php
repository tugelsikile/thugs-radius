<?php

namespace App\Validations\User;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserValidation
{
    public function delete(Request $request) {
        try {
            $valid = Validator::make($request->all(),[
                'id' => 'required|array|min:1',
                'id.*' => 'required|exists:users,id'
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
                __('messages.users.form_input.level') => 'required|exists:user_levels,id',
                __('messages.users.form_input.company') => 'nullable|exists:client_companies,id',
                __('messages.users.form_input.name') => 'required|string|min:2|max:199',
                __('messages.users.form_input.email') => 'required|email|unique:users,email',
                __('messages.users.form_input.password') => 'required|string|min:6|confirmed',
                __('messages.users.form_input.lang') => 'required|in:id,en',
                __('messages.users.form_input.date_format') => 'required|in:' . json_encode(allowedDateFormat()),
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
                'id' => 'required|exists:users,id',
                __('messages.users.form_input.level') => 'required|exists:user_levels,id',
                __('messages.users.form_input.company') => 'nullable|exists:client_companies,id',
                __('messages.users.form_input.name') => 'required|string|min:2|max:199',
                __('messages.users.form_input.email') => 'required|email|unique:users,email,' . $request->id . ',id',
                __('messages.users.form_input.password') => 'nullable|confirmed',
                __('messages.users.form_input.lang') => 'required|in:id,en',
                __('messages.users.form_input.date_format') => 'required|in:' . json_encode(allowedDateFormat()),
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),500);
        }
    }
}
