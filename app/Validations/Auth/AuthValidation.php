<?php /** @noinspection PhpUndefinedFieldInspection */
/** @noinspection PhpInconsistentReturnPointsInspection */

/** @noinspection PhpUndefinedMethodInspection */

namespace App\Validations\Auth;

use App\Models\User\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthValidation
{
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function updateLocale(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                __('users.form_input.lang') => 'required|string|in:id,en',
                __('users.form_input.date_format') => 'nullable',
                __('users.form_input.time_zone') => 'nullable',
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
    public function updatePassword(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                __('users.form_input.password.old') => ['required','min:5', function($attribute, $value, $fail) use ($request) {
                    if (User::where('id', auth()->guard('api')->user()->id)->first() !== null) {
                        if (! Hash::check($value, User::where('id', auth()->guard('api')->user()->id)->first()->password)) {
                            return $fail(__('validation.current_password'));
                        }
                    }
                }],
                __('users.form_input.password.current') => 'required|min:5|confirmed',
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
    public function updateAccount(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                __('users.form_input.id') => 'required|exists:users,id',
                __('users.form_input.name') => 'required|string|min:3|max:199',
                __('users.form_input.email') => 'required|email|unique:users,email,' . $request[__('users.form_input.id')] . ',id',
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
    public function updateAvatar(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                __('users.form_input.id') => 'required|exists:users,id',
                __('users.form_input.avatar') => 'required|image'
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
    public function resetPassword(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                'token' => 'required',
                __('auth.form_input.email') => 'required|exists:users,email',
                __('auth.form_input.password') => 'required|string|min:6|confirmed',
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
    public function googleLogin(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                __('auth.form_input.email') => 'required|email:rfc,dns,spoof|exists:users,email',
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
    public function googleRegister(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                __('companies.form_input.other') => 'required|string|min:3|max:199|unique:client_companies,name',
                __('messages.users.form_input.name') => 'required|string|min:3|max:199',
                __('auth.form_input.email') => 'required|email:rfc,dns,spoof|unique:users,email',
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
    public function register(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                __('companies.form_input.other') => 'required|string|min:3|max:199|unique:client_companies,name',
                __('messages.users.form_input.name') => 'required|string|min:3|max:199',
                __('auth.form_input.email') => 'required|email:rfc,dns,spoof|unique:users,email',
                __('auth.form_input.password') => 'required|min:6|confirmed'
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
    public function setLanguage(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                'lang' => 'required|in:id,en'
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
    public function login(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                __('auth.form_input.email') => 'required|email|exists:users,email',
                __('auth.form_input.password') => ['required','min:5', function($attribute, $value, $fail) use ($request) {
                    if (User::where('email', $request->email)->first() !== null) {
                        if (! Hash::check($value, User::where('email', $request[__(__('auth.form_input.email'))])->first()->password)) {
                            return $fail(__('auth.failed'));
                        }
                    }
                }]
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
