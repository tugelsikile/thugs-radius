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
    public function setLanguage(Request $request) {
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
