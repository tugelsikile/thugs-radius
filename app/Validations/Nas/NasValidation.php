<?php /** @noinspection PhpIfWithCommonPartsInspection */

/** @noinspection DuplicatedCode */

namespace App\Validations\Nas;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NasValidation
{
    /* @
     * @param Request $request
     * @return Request
     * @throws Exception
     */
    public function parentQueue(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                __('nas.form_input.name') => 'required|exists:nas,id'
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
    public function encryptDecrypt(Request $request): Request
    {
        try {
            $valid = Validator::make($request->all(),[
                'action' => 'required|in:encrypt,decrypt',
                'value' => 'required|string|min:100'
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
                'id.*' => 'required|exists:nas,id'
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
                __('nas.form_input.id') => 'required|exists:nas,id',
                __('companies.form_input.name') => 'required|exists:client_companies,id',
                __('nas.form_input.name') => 'required|string|min:1|max:50',
                __('nas.form_input.description') => 'nullable',
                __('nas.form_input.method') => 'required|string|in:api,ssl',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            if ($request[__('nas.form_input.method')] == 'api') {
                $valid = Validator::make($request->all(),[
                    __('nas.form_input.ip') => 'required|ip',
                ]);
                if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            } else {
                $valid = Validator::make($request->all(),[
                    __('nas.form_input.domain') => 'required|url',
                ]);
                if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            }
            $valid = Validator::make($request->all(),[
                __('nas.form_input.port') => 'required|numeric|min:100|max:999999999',
                __('nas.form_input.user') => 'required|string|min:0|max:50',
                __('nas.form_input.pass') => 'required|string|min:0|max:50|confirmed',
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
                __('companies.form_input.name') => 'required|exists:client_companies,id',
                __('nas.form_input.name') => 'required|string|min:1|max:50',
                __('nas.form_input.description') => 'nullable',
                __('nas.form_input.method') => 'required|string|in:api,ssl',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            if ($request[__('nas.form_input.method')] == 'api') {
                $valid = Validator::make($request->all(),[
                    __('nas.form_input.ip') => 'required|ip',
                ]);
                if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            } else {
                $valid = Validator::make($request->all(),[
                    __('nas.form_input.domain') => 'required|url',
                ]);
                if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            }
            $valid = Validator::make($request->all(),[
                __('nas.form_input.port') => 'required|numeric|min:100|max:999999999',
                __('nas.form_input.user') => 'required|string|min:0|max:50',
                __('nas.form_input.pass') => 'required|string|min:0|max:50|confirmed',
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
            $valid = Validator::make($request->all(),[
                __('nas.form_input.method') => 'required|string|in:api,ssl',
            ]);
            if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            if ($request[__('nas.form_input.method')] == 'api') {
                $valid = Validator::make($request->all(),[
                    __('nas.form_input.ip') => 'required|ip',
                    __('nas.form_input.port') => 'required|numeric|min:100|max:999999999',
                    __('nas.form_input.user') => 'required|string|min:0|max:50',
                    __('nas.form_input.pass') => 'required|string|min:0|max:50|confirmed',
                ]);
                if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            } else {
                $valid = Validator::make($request->all(),[
                    __('nas.form_input.domain') => 'required|url',
                    __('nas.form_input.port') => 'required|numeric|min:100|max:999999999',
                    __('nas.form_input.user') => 'required|string|min:0|max:50',
                    __('nas.form_input.pass') => 'required|string|min:0|max:50|confirmed',
                ]);
                if ($valid->fails()) throw new Exception(collect($valid->errors()->all())->join("\n"),400);
            }
            return $request;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage(),400);
        }
    }
}
